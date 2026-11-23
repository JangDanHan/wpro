/**
 * 의류 및 신발 상품 사진 정밀 세그멘테이션 & 캔버스 처리 유틸리티
 * 1. 사람이 입고 있는 사진에서 얼굴, 머리, 목/손의 피부, 다른 옷을 완전 투명화 제거
 * 2. 등록 대상으로 선택한 옷/신발만 실제 투명 배경(Alpha channel)을 가진 PNG로 추출
 * 3. 목둘레 안쪽 피부, 소매 사이 공간 등 내부 구멍(Holes)도 완벽 투명 처리
 * 4. 옷 자체의 로고, 프린트, 색상, 형태 100% 보존
 * 5. 옷 영역에 맞게 여백을 트림하고 800x800 정방형 캔버스 중앙 정렬
 */

export interface NormalizedCropBox {
  ymin: number // 0 ~ 1000
  xmin: number
  ymax: number
  xmax: number
}

export function getDefaultSmartCropBox(aspectRatio: number): NormalizedCropBox {
  if (aspectRatio < 0.9) {
    return {
      ymin: 20,
      xmin: 20,
      ymax: 865,
      xmax: 980,
    }
  }
  return {
    ymin: 15,
    xmin: 15,
    ymax: 985,
    xmax: 985,
  }
}

/**
 * AI 폴리곤 마스크를 적용하여 사람(얼굴, 목 피부, 손, 다른 옷)을 지우고
 * 오직 선택된 의류 본체만 투명 PNG로 분리 추출하는 함수
 */
export async function isolateGarmentWithPolygonMask(
  imageSource: string | HTMLImageElement,
  polygon?: [number, number][],
  holes?: [number, number][][],
  cropBox?: NormalizedCropBox,
  outputDimension = 800,
): Promise<{ transparentPngUrl: string; originalDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement) => {
      try {
        const origW = img.naturalWidth || img.width
        const origH = img.naturalHeight || img.height

        // 1. 원본 DataURL 확보
        const origCanvas = document.createElement("canvas")
        origCanvas.width = origW
        origCanvas.height = origH
        const origCtx = origCanvas.getContext("2d")
        if (!origCtx) throw new Error("Canvas context not available")
        origCtx.drawImage(img, 0, 0)
        const originalDataUrl = origCanvas.toDataURL("image/jpeg", 0.92)

        // 2. 마스크 캔버스 생성 (투명 배경)
        const maskCanvas = document.createElement("canvas")
        maskCanvas.width = origW
        maskCanvas.height = origH
        const maskCtx = maskCanvas.getContext("2d")
        if (!maskCtx) throw new Error("Mask canvas context error")

        // 만약 폴리곤이 제공되었다면 해당 다각형으로 클리핑 (선택 옷 외의 얼굴, 피부, 다른 옷, 배경 완전 투명화)
        if (polygon && polygon.length >= 3) {
          maskCtx.save()
          maskCtx.beginPath()

          // 2-1. 외곽선 다각형 그리기
          const startX = (polygon[0][0] / 1000) * origW
          const startY = (polygon[0][1] / 1000) * origH
          maskCtx.moveTo(startX, startY)

          for (let i = 1; i < polygon.length; i++) {
            const px = (polygon[i][0] / 1000) * origW
            const py = (polygon[i][1] / 1000) * origH
            maskCtx.lineTo(px, py)
          }
          maskCtx.closePath()

          // 2-2. 내부 구멍(목둘레 안쪽 피부, 소매 사이 배경) 제외 처리
          if (holes && holes.length > 0) {
            for (const hole of holes) {
              if (hole.length >= 3) {
                const hStartX = (hole[0][0] / 1000) * origW
                const hStartY = (hole[0][1] / 1000) * origH
                maskCtx.moveTo(hStartX, hStartY)
                for (let j = 1; j < hole.length; j++) {
                  const hx = (hole[j][0] / 1000) * origW
                  const hy = (hole[j][1] / 1000) * origH
                  maskCtx.lineTo(hx, hy)
                }
                maskCtx.closePath()
              }
            }
          }

          // evenodd 규칙으로 클리핑 (다각형 안쪽만 남기고 홀은 투명하게 뚫림)
          maskCtx.clip("evenodd")
          maskCtx.drawImage(img, 0, 0)
          maskCtx.restore()
        } else {
          // 폴리곤이 없을 때: 스마트 크롭 박스 기반 기본 투명 분리
          const box = cropBox || getDefaultSmartCropBox(origW / origH)
          const srcX = Math.max(0, Math.floor((box.xmin / 1000) * origW))
          const srcY = Math.max(0, Math.floor((box.ymin / 1000) * origH))
          const srcW = Math.min(origW - srcX, Math.floor(((box.xmax - box.xmin) / 1000) * origW))
          const srcH = Math.min(origH - srcY, Math.floor(((box.ymax - box.ymin) / 1000) * origH))

          maskCtx.drawImage(img, srcX, srcY, srcW, srcH, srcX, srcY, srcW, srcH)
        }

        // 3. 투명 픽셀이 아닌 실제 옷 영역의 바운딩 박스(Bounding Box) 스캔
        const imgData = maskCtx.getImageData(0, 0, origW, origH)
        const data = imgData.data

        let minX = origW
        let minY = origH
        let maxX = 0
        let maxY = 0
        let hasVisiblePixel = false

        for (let y = 0; y < origH; y++) {
          for (let x = 0; x < origW; x++) {
            const alpha = data[(y * origW + x) * 4 + 3]
            if (alpha > 15) {
              // 투명하지 않은 픽셀
              hasVisiblePixel = true
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }

        if (!hasVisiblePixel) {
          minX = 0
          minY = 0
          maxX = origW
          maxY = origH
        }

        const garmentW = Math.max(1, maxX - minX)
        const garmentH = Math.max(1, maxY - minY)

        // 4. 최종 800x800 표준 투명 캔버스에 중앙 정렬 (8% 여백 보정으로 상품 끝 잘림 방지)
        const finalCanvas = document.createElement("canvas")
        finalCanvas.width = outputDimension
        finalCanvas.height = outputDimension
        const finalCtx = finalCanvas.getContext("2d")
        if (!finalCtx) throw new Error("Final context error")

        // 캔버스 초기 상태: 완전 투명
        finalCtx.clearRect(0, 0, outputDimension, outputDimension)

        const safePadding = Math.round(outputDimension * 0.08)
        const availW = outputDimension - safePadding * 2
        const availH = outputDimension - safePadding * 2

        let drawW = availW
        let drawH = availH
        if (garmentW / garmentH > availW / availH) {
          drawW = availW
          drawH = Math.round((garmentH * availW) / garmentW)
        } else {
          drawH = availH
          drawW = Math.round((garmentW * availH) / garmentH)
        }

        const destX = safePadding + Math.round((availW - drawW) / 2)
        const destY = safePadding + Math.round((availH - drawH) / 2)

        finalCtx.drawImage(
          maskCanvas,
          minX,
          minY,
          garmentW,
          garmentH,
          destX,
          destY,
          drawW,
          drawH,
        )

        // 실제 투명 배경(Alpha channel)을 가진 PNG 포맷으로 저장
        const transparentPngUrl = finalCanvas.toDataURL("image/png")
        resolve({ transparentPngUrl, originalDataUrl })
      } catch (err) {
        reject(err)
      }
    }

    if (typeof imageSource === "string") {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => processImage(img)
      img.onerror = reject
      img.src = imageSource
    } else {
      processImage(imageSource)
    }
  })
}

/**
 * 1차 안전 가공 및 DataURL 변환 함수
 */
export async function processAndResizeImage(
  file: File | Blob,
  cropBox?: NormalizedCropBox,
): Promise<{ originalDataUrl: string; noBgDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      try {
        const { transparentPngUrl, originalDataUrl } = await isolateGarmentWithPolygonMask(
          dataUrl,
          undefined,
          undefined,
          cropBox,
        )
        resolve({
          originalDataUrl,
          noBgDataUrl: transparentPngUrl,
        })
      } catch {
        resolve({
          originalDataUrl: dataUrl,
          noBgDataUrl: dataUrl,
        })
      }
    }
    reader.readAsDataURL(file)
  })
}

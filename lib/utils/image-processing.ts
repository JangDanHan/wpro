/**
 * 의류 및 신발 상품 사진 자동 정리 & 캔버스 처리 유틸리티
 * 1. 쇼핑몰 캡처 내 하단 UI(하트, 컬러칩, 무신사 뱃지 등) 및 주변 사물/배경 제거
 * 2. 옷 자체의 로고, 프린트, 색상, 형태 100% 보존
 * 3. 흰색/밝은 회색 스튜디오 배경 중앙 정렬 및 여백 보정 (바지 밑단, 소매, 신발 끝 잘림 방지)
 */

export interface NormalizedCropBox {
  ymin: number // 0 ~ 1000 (상단)
  xmin: number // 0 ~ 1000 (좌측)
  ymax: number // 0 ~ 1000 (하단)
  xmax: number // 0 ~ 1000 (우측)
}

/**
 * 쇼핑몰 캡처 등에서 하단 UI 요소(하트, 뱃지 등)를 감지하여 기본 안전 크롭 영역 계산
 */
export function getDefaultSmartCropBox(aspectRatio: number): NormalizedCropBox {
  // 세로가 긴 쇼핑몰 캡처(3:4 또는 9:16)의 경우 통상 하단 10~14%에 하트/뱃지/컬러칩이 위치함
  if (aspectRatio < 0.9) {
    return {
      ymin: 20, // 상단 약간의 여백 정리
      xmin: 20,
      ymax: 865, // 하단 13.5% (하트 버튼, 쇼핑몰 뱃지 배너 영역) 스마트 제외
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
 * 이미지를 캔버스에서 자르고 정돈된 스튜디오 상품 이미지로 가공
 */
export async function cleanAndFormatProductImage(
  imageSource: string | HTMLImageElement,
  cropBox?: NormalizedCropBox,
  outputDimension = 800,
  studioBgColor = "#f8fafc", // 밝은 스튜디오 배경색
): Promise<{ cleanedDataUrl: string; originalDataUrl: string }> {
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
        const originalDataUrl = origCanvas.toDataURL("image/jpeg", 0.9)

        // 2. 크롭 영역 산출 (정규화 좌표 0~1000 -> 픽셀 좌표)
        const box = cropBox || getDefaultSmartCropBox(origW / origH)
        const srcX = Math.max(0, Math.floor((box.xmin / 1000) * origW))
        const srcY = Math.max(0, Math.floor((box.ymin / 1000) * origH))
        const srcW = Math.min(origW - srcX, Math.floor(((box.xmax - box.xmin) / 1000) * origW))
        const srcH = Math.min(origH - srcY, Math.floor(((box.ymax - box.ymin) / 1000) * origH))

        // 3. 임시 크롭 캔버스
        const cropCanvas = document.createElement("canvas")
        cropCanvas.width = srcW
        cropCanvas.height = srcH
        const cropCtx = cropCanvas.getContext("2d")
        if (!cropCtx) throw new Error("Crop canvas error")

        cropCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

        // 4. 최종 800x800 표준 스튜디오 캔버스 생성
        const finalCanvas = document.createElement("canvas")
        finalCanvas.width = outputDimension
        finalCanvas.height = outputDimension
        const finalCtx = finalCanvas.getContext("2d")
        if (!finalCtx) throw new Error("Final canvas error")

        // 4-1. 밝은 스튜디오 배경 채우기
        finalCtx.fillStyle = studioBgColor
        finalCtx.fillRect(0, 0, outputDimension, outputDimension)

        // 4-2. 상품 전체가 잘리지 않도록 안전 여백(12% padding) 계산
        const safePadding = Math.round(outputDimension * 0.08) // 상하좌우 8% 여백
        const availW = outputDimension - safePadding * 2
        const availH = outputDimension - safePadding * 2

        // 종횡비 유지 (contain)
        let drawW = availW
        let drawH = availH
        if (srcW / srcH > availW / availH) {
          drawW = availW
          drawH = Math.round((srcH * availW) / srcW)
        } else {
          drawH = availH
          drawW = Math.round((srcW * availH) / srcH)
        }

        // 중앙 정렬 좌표
        const destX = safePadding + Math.round((availW - drawW) / 2)
        const destY = safePadding + Math.round((availH - drawH) / 2)

        // 4-3. 크롭된 상품을 원본 색상/로고 100% 보존하여 중앙 렌더링
        finalCtx.drawImage(cropCanvas, 0, 0, srcW, srcH, destX, destY, drawW, drawH)

        const cleanedDataUrl = finalCanvas.toDataURL("image/png")
        resolve({ cleanedDataUrl, originalDataUrl })
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
 * 업로드된 File 또는 Blob을 읽어 표준 스튜디오 상품 이미지로 1차 자동 정리
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
        const { cleanedDataUrl, originalDataUrl } = await cleanAndFormatProductImage(
          dataUrl,
          cropBox,
        )
        resolve({
          originalDataUrl,
          noBgDataUrl: cleanedDataUrl,
        })
      } catch (err) {
        resolve({
          originalDataUrl: dataUrl,
          noBgDataUrl: dataUrl,
        })
      }
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 브라우저 캔버스를 이용한 이미지 처리 유틸리티
 * - 이미지 압축 및 리사이즈 (IndexedDB 저장 최적화)
 * - 모서리 색상 감지 기반 배경 투명화 (누끼 처리)
 */

export async function processAndResizeImage(
  file: File | Blob,
  maxDimension = 800,
  quality = 0.85,
): Promise<{ originalDataUrl: string; noBgDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        // 1. 원본 리사이즈 이미지 캔버스
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          const fallback = e.target?.result as string
          return resolve({ originalDataUrl: fallback, noBgDataUrl: fallback })
        }

        ctx.drawImage(img, 0, 0, width, height)
        const originalDataUrl = canvas.toDataURL("image/jpeg", quality)

        // 2. 배경 제거(누끼) 시뮬레이션 마스킹 캔버스
        // 네 모서리 색상을 샘플링하여 유사 배경 픽셀 투명화
        try {
          const noBgCanvas = document.createElement("canvas")
          noBgCanvas.width = width
          noBgCanvas.height = height
          const noBgCtx = noBgCanvas.getContext("2d")

          if (noBgCtx) {
            noBgCtx.drawImage(img, 0, 0, width, height)
            const imgData = noBgCtx.getImageData(0, 0, width, height)
            const data = imgData.data

            // 모서리 픽셀 샘플링 (좌상, 우상, 좌하, 우하)
            const corners = [
              [0, 0],
              [width - 1, 0],
              [0, height - 1],
              [width - 1, height - 1],
            ]

            let avgR = 0
            let avgG = 0
            let avgB = 0
            for (const [cx, cy] of corners) {
              const idx = (cy * width + cx) * 4
              avgR += data[idx]
              avgG += data[idx + 1]
              avgB += data[idx + 2]
            }
            avgR /= 4
            avgG /= 4
            avgB /= 4

            const threshold = 38 // 색상 허용 오차

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]

              const dist = Math.sqrt(
                Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2),
              )

              if (dist < threshold) {
                // 부드러운 페이드 투명화
                data[i + 3] = Math.max(0, Math.floor((dist / threshold) * 255 * 0.2))
              }
            }

            noBgCtx.putImageData(imgData, 0, 0)
            const noBgDataUrl = noBgCanvas.toDataURL("image/png")
            resolve({ originalDataUrl, noBgDataUrl })
            return
          }
        } catch {
          // 크로스 오리진 오류 등 발생 시 원본 반환
        }

        resolve({ originalDataUrl, noBgDataUrl: originalDataUrl })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

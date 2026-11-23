"use client"

import { useState } from "react"
import {
  BodyProfile,
  ClosetItem,
  VirtualEditResult,
  CATEGORY_LABELS,
} from "@/lib/domain/closet-types"
import {
  DEFAULT_BODY_PROFILE,
  SKIN_TONE_COLORS,
  VIRTUAL_FITTING_DISCLAIMER,
  applyNaturalLanguageEdit,
  COLOR_MAP,
} from "@/lib/domain/virtual-fitting"
import {
  Wand2,
  Sparkles,
  User,
  Sliders,
  RotateCcw,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Bookmark,
  Trash2,
} from "lucide-react"

interface VirtualFittingRoomProps {
  clothes: ClosetItem[]
  selectedOutfitItems: ClosetItem[]
  bodyProfile: BodyProfile | null
  onSaveBodyProfile: (profile: BodyProfile) => Promise<void>
  onDeleteBodyProfile: () => Promise<void>
  onSaveVirtualEdit: (result: VirtualEditResult) => Promise<void>
}

export function VirtualFittingRoom({
  clothes,
  selectedOutfitItems,
  bodyProfile,
  onSaveBodyProfile,
  onDeleteBodyProfile,
  onSaveVirtualEdit,
}: VirtualFittingRoomProps) {
  // 체형 프로필 상태 (미설정 시 기본값)
  const currentProfile = bodyProfile || DEFAULT_BODY_PROFILE
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<BodyProfile>(currentProfile)

  // 자연어 편집 상태
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<ClosetItem | null>(
    selectedOutfitItems[0] || clothes[0] || null,
  )
  const [editPrompt, setEditPrompt] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editResult, setEditResult] = useState<VirtualEditResult | null>(null)
  const [isSavedResult, setIsSavedResult] = useState(false)

  // 선택된 코디 부위별 아이템 찾기
  const topItem = selectedOutfitItems.find((i) => i.category === "top")
  const bottomItem = selectedOutfitItems.find((i) => i.category === "bottom")
  const outerItem = selectedOutfitItems.find((i) => i.category === "outer")
  const shoesItem = selectedOutfitItems.find((i) => i.category === "shoes")

  const handleProfileSave = async () => {
    await onSaveBodyProfile(profileForm)
    setIsEditingProfile(false)
  }

  const handleProfileReset = async () => {
    await onDeleteBodyProfile()
    setProfileForm(DEFAULT_BODY_PROFILE)
    setIsEditingProfile(false)
  }

  const handleNaturalEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemForEdit || !editPrompt.trim()) return

    setIsEditing(true)
    setIsSavedResult(false)
    try {
      const result = await applyNaturalLanguageEdit(selectedItemForEdit, editPrompt)
      setEditResult(result)
    } finally {
      setIsEditing(false)
    }
  }

  const handleSaveVirtualEditResult = async () => {
    if (!editResult) return
    await onSaveVirtualEdit(editResult)
    setIsSavedResult(true)
  }

  // 아바타 체형 렌더링용 변수
  const avatarWidth =
    currentProfile.bodyType === "slim"
      ? 140
      : currentProfile.bodyType === "athletic"
      ? 170
      : currentProfile.bodyType === "plus"
      ? 185
      : 155
  const skinColor = SKIN_TONE_COLORS[currentProfile.skinTone] || "#FDE2D2"

  return (
    <div className="space-y-5">
      {/* 1. 참고용 안내 배너 (요구사항 필수) */}
      <div className="p-3.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
        <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{VIRTUAL_FITTING_DISCLAIMER}</span>
      </div>

      {/* 2. 체형 아바타 설정 & 2D 가상 피팅 뷰어 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                체형 기반 아바타 피팅
              </h3>
              <p className="text-[11px] text-zinc-500">
                {bodyProfile
                  ? `${bodyProfile.height || 172}cm • ${
                      bodyProfile.bodyType === "slim"
                        ? "슬림형"
                        : bodyProfile.bodyType === "athletic"
                        ? "체격형"
                        : bodyProfile.bodyType === "plus"
                        ? "플러스형"
                        : "표준형"
                    }`
                  : "기본 표준 아바타 적용 중 (선택 사양)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? "닫기" : "체형 설정"}</span>
          </button>
        </div>

        {/* 체형 설정 폼 토글 */}
        {isEditingProfile && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3.5 animate-in fade-in-50">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                  키 (cm): {profileForm.height || 172}cm
                </label>
                <input
                  type="range"
                  min="140"
                  max="200"
                  value={profileForm.height || 172}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, height: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                  체형 유형
                </label>
                <select
                  value={profileForm.bodyType}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bodyType: e.target.value as any })
                  }
                  className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                >
                  <option value="slim">슬림형</option>
                  <option value="standard">표준형</option>
                  <option value="athletic">운동/체격형</option>
                  <option value="plus">플러스형</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                  피부톤
                </label>
                <div className="flex gap-2">
                  {(["light", "medium", "tan", "dark"] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, skinTone: tone })}
                      style={{ backgroundColor: SKIN_TONE_COLORS[tone] }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        profileForm.skinTone === tone
                          ? "border-indigo-600 scale-110 shadow-xs"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleProfileReset}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>체형 정보 삭제</span>
              </button>

              <button
                type="button"
                onClick={handleProfileSave}
                className="py-1.5 px-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
              >
                저장하기
              </button>
            </div>
          </div>
        )}

        {/* 2D 아바타 피팅 캔버스 뷰 */}
        <div className="relative h-72 sm:h-80 w-full bg-gradient-to-b from-zinc-100/80 to-zinc-200/50 dark:from-zinc-800/60 dark:to-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
          {/* 아바타 SVG 실루엣 */}
          <svg
            viewBox="0 0 200 320"
            className="h-full drop-shadow-md transition-all duration-300"
            style={{ width: `${avatarWidth}px` }}
          >
            {/* 머리 */}
            <circle cx="100" cy="40" r="22" fill={skinColor} />
            <path d="M 80 32 Q 100 16 120 32 Q 100 24 80 32 Z" fill="#27272a" />

            {/* 목 */}
            <rect x="94" y="60" width="12" height="14" fill={skinColor} />

            {/* 상의 / 이너 레이어 */}
            <path
              d="M 68 74 L 132 74 L 126 150 L 74 150 Z"
              fill={
                topItem?.colors?.[0] && COLOR_MAP[topItem.colors[0]]
                  ? COLOR_MAP[topItem.colors[0]]
                  : "#e4e4e7"
              }
            />

            {/* 아우터 레이어 (아우터가 있을 시 겉에 레이어드) */}
            {outerItem && (
              <path
                d="M 62 72 L 78 72 L 80 165 L 60 165 Z M 138 72 L 122 72 L 120 165 L 140 165 Z"
                fill={
                  outerItem?.colors?.[0] && COLOR_MAP[outerItem.colors[0]]
                    ? COLOR_MAP[outerItem.colors[0]]
                    : "#3f3f46"
                }
                opacity="0.95"
              />
            )}

            {/* 팔 */}
            <path d="M 68 74 L 56 145 L 66 145 L 75 80 Z" fill={skinColor} />
            <path d="M 132 74 L 144 145 L 134 145 L 125 80 Z" fill={skinColor} />

            {/* 하의 레이어 */}
            <path
              d="M 74 148 L 126 148 L 124 240 L 105 240 L 100 170 L 95 240 L 76 240 Z"
              fill={
                bottomItem?.colors?.[0] && COLOR_MAP[bottomItem.colors[0]]
                  ? COLOR_MAP[bottomItem.colors[0]]
                  : "#27272a"
              }
            />

            {/* 신발 레이어 */}
            <ellipse
              cx="86"
              cy="252"
              rx="12"
              ry="7"
              fill={
                shoesItem?.colors?.[0] && COLOR_MAP[shoesItem.colors[0]]
                  ? COLOR_MAP[shoesItem.colors[0]]
                  : "#ffffff"
              }
              stroke="#d4d4d8"
              strokeWidth="1"
            />
            <ellipse
              cx="114"
              cy="252"
              rx="12"
              ry="7"
              fill={
                shoesItem?.colors?.[0] && COLOR_MAP[shoesItem.colors[0]]
                  ? COLOR_MAP[shoesItem.colors[0]]
                  : "#ffffff"
              }
              stroke="#d4d4d8"
              strokeWidth="1"
            />
          </svg>

          {/* 피팅 정보 태그 오버레이 */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 text-[10px]">
            {topItem && (
              <span className="px-2 py-0.5 bg-white/90 dark:bg-zinc-900/90 rounded-md border border-zinc-200 dark:border-zinc-700 font-semibold">
                상의: {topItem.name}
              </span>
            )}
            {outerItem && (
              <span className="px-2 py-0.5 bg-white/90 dark:bg-zinc-900/90 rounded-md border border-zinc-200 dark:border-zinc-700 font-semibold">
                외투: {outerItem.name}
              </span>
            )}
            {bottomItem && (
              <span className="px-2 py-0.5 bg-white/90 dark:bg-zinc-900/90 rounded-md border border-zinc-200 dark:border-zinc-700 font-semibold">
                하의: {bottomItem.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. 자연어로 코디 이미지 편집 (요구사항: 원본 보존, 비교 보기, 되돌리기, 별도 보관) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              자연어로 코디 이미지 가상 편집
            </h3>
            <p className="text-[11px] text-zinc-500">
              "파란색으로 바꿔줘", "소매를 긴팔로 바꿔줘"처럼 말하면 가상 시뮬레이션을 보여드려요.
            </p>
          </div>
        </div>

        {/* 편집 대상 옷 선택 */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            편집할 옷 선택
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {clothes.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedItemForEdit(item)
                  setEditResult(null)
                  setIsSavedResult(false)
                }}
                className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border text-xs shrink-0 transition-all cursor-pointer ${
                  selectedItemForEdit?.id === item.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold shadow-xs"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                <img
                  src={item.noBgImageUrl || item.originalImageUrl}
                  alt={item.name}
                  className="w-7 h-7 object-contain rounded-lg"
                />
                <span className="truncate max-w-[100px]">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 자연어 입력 폼 */}
        <form onSubmit={handleNaturalEditSubmit} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="예: 이 옷을 파란색으로 바꿔줘 / 긴팔로 바꿔줘"
              className="w-full pl-3 pr-20 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isEditing || !editPrompt.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {isEditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "가상 편집"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
            <span>추천 예시:</span>
            {["블루 색상으로 변경", "블랙으로 시크하게", "긴팔 스타일로 변경"].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setEditPrompt(ex)}
                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-md text-zinc-600 dark:text-zinc-400"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>

        {/* 원본 vs 편집본 비교 뷰어 (Before & After) */}
        {editResult && selectedItemForEdit && (
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>가상 편집 결과 비교 (원본 옷은 안전하게 보존됩니다)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">
                {editResult.diffSummary}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 원본 사진 */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-2.5 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Before (보유 원본)
                </span>
                <div className="h-32 w-full flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedItemForEdit.noBgImageUrl || selectedItemForEdit.originalImageUrl}
                    alt="원본"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate w-full text-center mt-1">
                  {selectedItemForEdit.name}
                </p>
              </div>

              {/* 편집된 가상 이미지 */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-2.5 border border-purple-300 dark:border-purple-800 ring-1 ring-purple-300 flex flex-col items-center">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  After (가상 시뮬레이션)
                </span>
                <div className="h-32 w-full flex items-center justify-center overflow-hidden">
                  <img
                    src={editResult.modifiedImageUrl}
                    alt="가상 편집본"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-[11px] font-bold text-purple-900 dark:text-purple-200 truncate w-full text-center mt-1">
                  {editResult.diffSummary}
                </p>
              </div>
            </div>

            {/* 액션 버튼 (되돌리기 / 가상 스타일 별도 보관) */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setEditResult(null)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>되돌리기 (초기화)</span>
              </button>

              <button
                type="button"
                disabled={isSavedResult}
                onClick={handleSaveVirtualEditResult}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSavedResult
                    ? "bg-emerald-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
                }`}
              >
                {isSavedResult ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>가상 옷장에 보관됨</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>가상 스타일로 별도 저장</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

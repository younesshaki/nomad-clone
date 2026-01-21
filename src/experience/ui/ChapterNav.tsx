interface ChapterNavProps {
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
}

export default function ChapterNav({ currentChapter, onChapterChange }: ChapterNavProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "1rem",
        zIndex: 1000,
      }}
    >
      {[1, 2, 3, 4].map((chapter) => (
        <div
          key={chapter}
          className="relative inline-flex items-center justify-center gap-4 group"
        >
          <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200" />
          <button
            type="button"
            role="button"
            title={`Chapter ${chapter}`}
            onClick={() => onChapterChange(chapter)}
            className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
          >
            Chapter {chapter}
            <svg
              aria-hidden="true"
              viewBox="0 0 10 10"
              height="10"
              width="10"
              fill="none"
              className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
            >
              <path
                d="M0 5h7"
                className="transition opacity-0 group-hover:opacity-100"
              />
              <path
                d="M1 1l4 4-4 4"
                className="transition group-hover:translate-x-[3px]"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

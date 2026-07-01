export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4 text-white"
                >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-none font-bold text-gray-900 dark:text-white tracking-wide">
                    FlashBurst
                </span>
                <span className="truncate text-xs text-gray-500 font-medium">
                    Sale Engine
                </span>
            </div>
        </>
    );
}
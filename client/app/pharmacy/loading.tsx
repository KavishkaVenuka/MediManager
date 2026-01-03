import { SkeletonCard } from '@/components/SkeletonCard';

const Loading = () => {
    return (
        <div className="flex flex-col h-full bg-gray-50 pb-24 font-sans">
            <div className="px-4 py-4 space-y-4 overflow-y-auto">
                {Array(8).fill(null).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        </div>
    );
};

export default Loading;

import { cn } from "@/lib/utils"

const LoadingCircle = ({ isSpinning = false }: { isSpinning?: boolean }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div
        className={cn(
          "w-12 h-12 border-[3px] border-[#DD6C4A]/20 border-t-[#DD6C4A] rounded-full transition-opacity duration-300",
          isSpinning ? "animate-spin opacity-100" : "opacity-0",
          "motion-reduce:animate-none"
        )}
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
};

export default LoadingCircle;
const LoadingCircle = ({ isSpinning = false }: { isSpinning?: boolean }) => {
  return (
    <div
      className={`w-[10em] h-[10em] rounded-full border-4 border-purple-500 ${
        isSpinning ? "animate-spin border-t-transparent" : ""
      }`}
    />
  );
};

export default LoadingCircle;

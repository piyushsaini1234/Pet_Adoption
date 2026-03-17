const Loader = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-gray-500 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Spinner size="md" />
      <p className="mt-3 text-gray-400 text-sm">{message}</p>
    </div>
  );
};

const Spinner = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div
      className={`${sizeClass} border-orange-200 border-t-orange-500 rounded-full animate-spin`}
    />
  );
};

export { Spinner };
export default Loader;

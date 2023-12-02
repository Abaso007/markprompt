export const DotsBackground = () => {
  return (
    <div className="absolute top-0 h-[calc(100vh-30px)] w-full sm:h-screen">
      <div className="home-dots absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-neutral-1100/0 to-neutral-1100" />
    </div>
  );
};

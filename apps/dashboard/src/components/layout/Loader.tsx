import ThemeAwareLottie from '@/components/common/uiComponents/ThemeAwareLottie'
import LoadingJson from '@/assets/icons/animated/loading.json'

function LoaderPage() {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <ThemeAwareLottie
        className="size-80"
        animationData={LoadingJson}
        loop={true}
      />
    </div>
  )
}

export default LoaderPage

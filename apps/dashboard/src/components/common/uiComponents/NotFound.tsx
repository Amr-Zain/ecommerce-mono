import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import NotFoundJson from '@/assets/icons/animated/404.json'
import { Button } from '@ecommerce/ui/components/button'
import ThemeAwareLottie from './ThemeAwareLottie'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-[calc(100vh-150px)] main-card flex flex-col items-center justify-center space-y-10">
      <ThemeAwareLottie
        className="h-[400px] mx-auto"
        animationData={NotFoundJson}
        loop
        colorMappings={{
          "0.2314,0.5098,0.9647": "--primary",       // Main Blue -> Primary
          "0.4157,0.6627,0.8745": "--chart-2",       // Light Blue -> Cyan/Secondary
          "0.3373,0.3373,0.3373": "--foreground",    // Dark Gray -> Text color
          "1,0.9961,0.9961": "--background",       // Eye white -> Background layer
          "1,1,1": "--accent",                     // Body Highlights -> Accent color
        }}
      />
      <p className="text-xl text-muted-foreground mt-2 font-medium">
        {t('wrong_page')}
      </p>

      <Button size="lg" className="px-6">
        <Link to="/" aria-label={t('go_home')}>
          {t('go_home')}
        </Link>
      </Button>
    </div>
  )
}

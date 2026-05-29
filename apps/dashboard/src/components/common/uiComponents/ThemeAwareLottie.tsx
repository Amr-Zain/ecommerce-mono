import Lottie, { LottieComponentProps } from "lottie-react";
import { useThemeAwareLottie } from "@/util/colorizeLottie";
import { useMemo } from "react";

interface ThemeAwareLottieProps extends Omit<LottieComponentProps, 'animationData'> {
    animationData: any;
    colorMappings?: Record<string, string>;
}

/**
 * A wrapper around the Lottie component that automatically adjusts colors to match the theme.
 * Default mappings are provided for common colors found in the project's assets.
 */
const ThemeAwareLottie = ({ animationData, colorMappings, ...props }: ThemeAwareLottieProps) => {
    const defaultMappings = useMemo(() => ({
        "0.2314,0.5098,0.9647": "--primary",
        "0.4157,0.6627,0.8745": "--chart-2",
        "0.3373,0.3373,0.3373": "--foreground",
        "1,0.9961,0.9961": "--background",
        "1,1,1": "--accent",
    }), []);

    const effectiveMappings = useMemo(() => ({
        ...defaultMappings,
        ...colorMappings
    }), [defaultMappings, colorMappings]);

    const coloredData = useThemeAwareLottie(animationData, effectiveMappings);

    // Use a unique key based on the processed data to force lottie-react to re-render
    // We use a small hash or just a counter could work, but JSON stringify is safest for uniqueness
    return <Lottie {...props} key={JSON.stringify(effectiveMappings)} animationData={coloredData} />;
};

export default ThemeAwareLottie;

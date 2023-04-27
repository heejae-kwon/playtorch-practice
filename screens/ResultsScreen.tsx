import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    LayoutRectangle
} from "react-native";
import { Canvas, CanvasRenderingContext2D, Image as ImageType, } from "react-native-pytorch-core";

const objectColors = [
    "#FF3B30",
    "#5856D6",
    "#34C759",
    "#007AFF",
    "#FF9500",
    "#AF52DE",
    "#5AC8FA",
    "#FFCC00",
    "#FF2D55",
];

const textBaselineAdjustment = Platform.OS == "ios" ? 7 : 4;

type Props = {
    image: ImageType | null;
    onReset: () => void;
}

export default function ResultsScreen({ image, onReset }: Props) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [layout, setLayout] = useState<LayoutRectangle | null>(null);

    // This is a drawImage function wrapped in useCallback (for improving render performance)
    useEffect(
        () => {
            if (ctx != null && layout != null && image != null) {
                ctx.clearRect(0, 0, layout.width, layout.height);

                // Scale image to fit screen
                const imageWidth = image.getWidth();
                const imageHeight = image.getHeight();
                const scale = Math.min(
                    layout.width / imageWidth,
                    layout.height / imageHeight
                );
                const displayWidth = imageWidth * scale;
                const displayHeight = imageHeight * scale;
                const offsetX = (layout.width - displayWidth) / 2;
                const offsetY = (layout.height - displayHeight) / 2;
                ctx.drawImage(image, offsetX, offsetY, displayWidth, displayHeight);
                ctx.invalidate()
            }
        },
        [ctx, layout, image] // dependencies for useCallback
    );

    return (
        <View style={styles.container}>
            <Canvas
                style={StyleSheet.absoluteFill}
                onLayout={(event) => {
                    setLayout(event.nativeEvent.layout);
                }}
                onContext2D={setCtx}
            />
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={onReset} style={styles.resetButton}>
                    <Text style={styles.buttonLabel}>Take another picture</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        position: "absolute",
        width: "100%",
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    resetButton: {
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    buttonLabel: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
    },
});

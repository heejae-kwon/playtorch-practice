
import * as React from "react";
import { useRef } from "react";
import { StyleSheet } from "react-native";
import { Camera, Image } from "react-native-pytorch-core";

export interface CameraScreenProps {
    onCapture: (image: Image) => Promise<void>
}
export default function CameraScreen({ onCapture }: CameraScreenProps) {
    const cameraRef = React.useRef<Camera>(null);

    return (
        <Camera
            onCapture={onCapture}
            style={styles.camera}
            ref={cameraRef}
        />);
    { /*      <Camera
            ref={cameraRef}
            style={styles.camera}
            onCapture={onCapture}
            targetResolution={{ width: 1080, height: 1920 }}
/> */}
}

const styles = StyleSheet.create({
    camera: { width: "100%", height: "100%" },
});

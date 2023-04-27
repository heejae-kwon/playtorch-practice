/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraScreen from './screens/CameraScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import { Image, ImageUtil } from 'react-native-pytorch-core';
import removeBackground from './src/Rembg';
import { prepareAssets } from './src/AssetHelper';

const ScreenStates = {
  CAMERA: 0,
  LOADING: 1,
  RESULTS: 2,
};

const App = () => {
  const [inputImage, setInputImage] = useState<Image | null>(null);
  const [rembgImage, setRembgImage] = useState<Image | null>(null);
  const [screenState, setScreenState] = useState(ScreenStates.CAMERA);

  // Handle the reset button and return to the camera capturing mode
  const handleReset = useCallback(async () => {
    setScreenState(ScreenStates.CAMERA);
    if (inputImage != null) {
      inputImage.release();
    }
    setInputImage(null);
    setRembgImage(null);
  }, [inputImage, setInputImage, setRembgImage, setScreenState]);

  // This handler function handles the camera's capture event
  async function handleImage(capturedImage: Image) {
    // Wait for image to process through YOLOv5 model and draw resulting image
    setScreenState(ScreenStates.LOADING);
    try {
      const newImage = await removeBackground(inputImage!);
      setRembgImage(newImage)
      //  setBoundingBoxes(newBoxes);
      // Switch to the ResultsScreen to display the detected objects
      setScreenState(ScreenStates.RESULTS);
    } catch (err) {
      // In case something goes wrong, go back to the CameraScreen to take a new picture
      handleReset();
    }
  }
  async function loadAssets() {
    const testImg = await ImageUtil.fromBundle(require('./assets/image/prof1.jpg'))
    setInputImage(testImg);
    await prepareAssets()
  }

  useEffect(() => {
    loadAssets()

    return () => {
      console.log('컴포넌트가 화면에서 사라짐');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {screenState === ScreenStates.CAMERA && <CameraScreen onCapture={handleImage} />}
      {screenState === ScreenStates.LOADING && <LoadingScreen />}
      {screenState === ScreenStates.RESULTS && (
        <ResultsScreen
          image={rembgImage as Image}
          onReset={handleReset}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

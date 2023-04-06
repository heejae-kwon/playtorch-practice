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
import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraScreen from './screens/CameraScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import { Image } from 'react-native-pytorch-core';
import detectObjects, { BBox } from './ObjectDetector';

const ScreenStates = {
  CAMERA: 0,
  LOADING: 1,
  RESULTS: 2,
};

const App = () => {
  const [image, setImage] = useState<Image | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BBox[] | null>(null);
  const [screenState, setScreenState] = useState(ScreenStates.CAMERA);

  // Handle the reset button and return to the camera capturing mode
  const handleReset = useCallback(async () => {
    setScreenState(ScreenStates.CAMERA);
    if (image != null) {
      await image.release();
    }
    setImage(null);
    setBoundingBoxes(null);
  }, [image, setScreenState]);

  // This handler function handles the camera's capture event
  async function handleImage(capturedImage: Image) {
    setImage(capturedImage);
    // Wait for image to process through YOLOv5 model and draw resulting image
    setScreenState(ScreenStates.LOADING);
    try {
      const newBoxes = await detectObjects(capturedImage);
      setBoundingBoxes(newBoxes);
      // Switch to the ResultsScreen to display the detected objects
      setScreenState(ScreenStates.RESULTS);
    } catch (err) {
      // In case something goes wrong, go back to the CameraScreen to take a new picture
      handleReset();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {screenState === ScreenStates.CAMERA && <CameraScreen onCapture={handleImage} />}
      {screenState === ScreenStates.LOADING && <LoadingScreen />}
      {screenState === ScreenStates.RESULTS && (
        <ResultsScreen
          image={image as Image}
          boundingBoxes={boundingBoxes as BBox[]}
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

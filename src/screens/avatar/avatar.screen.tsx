import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import FastImage from 'react-native-fast-image';

const AvatarScreen = () => {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [camera, setCamera] = useState<RNCamera | null>(null);
  const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stickerGif, setStickerGif] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
    if (result === RESULTS.GRANTED) {
      setCameraPermission(true);
    } else {
      setCameraPermission(false);
    }
  };


// Function to delete a key from AsyncStorage
const deleteFromLocalStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Key '${key}' has been removed from local storage.`);
  } catch (error) {
    console.error(`Error deleting key '${key}' from local storage:`, error);
  }
};

// Usage


  const checkCameraPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.CAMERA);

    if (result === RESULTS.GRANTED) {
      setCameraPermission(true);
    } else {
      await requestCameraPermission();
    }
  };

const sendPictureToAPI = async (byteArray) => {
  // Replace this URL with your API endpoint
  const apiUrl = 'http://deploy-mirror.eba-zbmd9pyk.us-west-2.elasticbeanstalk.com/api/generate-face';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'image/png',
      },
      body: byteArray.buffer,
    });

    console.log(response);

    if (!response.ok) {
      console.error('API response:', response);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    if (result.ok && result.face && result.face.url) {
      await AsyncStorage.setItem('faceImageUrl', result.face.url);
      setFaceImageUrl(result.face.url);
      // Call the getStickerGif function with the face ID
      getStickerGif(result.face.id);
    }
  } catch (error) {
    console.error(error);
  }
};
const getStickerGif = async (faceId) => {
  // Replace this URL with your API endpoint
  console.log("generate gif")
  const apiUrl = `http://deploy-mirror.eba-zbmd9pyk.us-west-2.elasticbeanstalk.com/api/generate-stickers/${faceId}`;
  try {
    const response = await RNFetchBlob.fetch('GET', apiUrl, {
      Accept: 'application/octet-stream',
    });

    const base64Data = response.base64();
    await AsyncStorage.setItem('stickerGif', base64Data);
  } catch (error) {
    console.error(error);
  }
};
const takePicture = async () => {
  if (camera && !isCapturing) {
    setIsCapturing(true);
    const options = { quality: 0.5, doNotSave: true, base64: true, format: 'png' };// Add 'format: "jpeg"'
    try {
      const data = await camera.takePictureAsync(options);
      const base64Data = data.base64;
      const byteArray = Uint8Array.from(base64.decode(base64Data), c => c.charCodeAt(0));
      sendPictureToAPI(byteArray);
    } catch (error) {
      console.error("Error while taking a picture:", error);
    } finally {
      setIsCapturing(false);
    }
  }
};

useEffect(() => {
  (async () => {
    const storedGif = await AsyncStorage.getItem('stickerGif');
    if (storedGif) {
      setStickerGif(storedGif);
    }
  })();
}, []);

  useEffect(() => {
    checkCameraPermission();
    (async () => {

      const storedUrl = await AsyncStorage.getItem('faceImageUrl');
      if (storedUrl) {
        setFaceImageUrl(storedUrl);
      }
    })();
  }, []);

return (
  <View style={styles.container}>
    {stickerGif  ? (
  <FastImage
    source={{uri: `data:image/gif;base64,${stickerGif}`}}
    style={styles.stickerGif}
  />
    ) : cameraPermission ? (
      <RNCamera
        ref={(ref) => setCamera(ref)}
        style={styles.preview}
        type={RNCamera.Constants.Type.front}
        captureAudio={false}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePicture} style={styles.capture}>
            <Text style={styles.buttonText}>SNAP</Text>
          </TouchableOpacity>
        </View>
      </RNCamera>
    ) : (
      <Text>No access to camera</Text>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  stickerGif: {
    width: '100%', // Set the width as you need
    height: '70%', // Set the height as you need
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  faceImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  urlText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    margin: 20,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  capture: {
    flex: 0,
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 14,
    color: 'white',
  },
});

export default AvatarScreen;
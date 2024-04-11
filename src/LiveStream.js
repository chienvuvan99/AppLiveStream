import React, {useState, useEffect, useRef} from 'react';
import {View, Button, Alert, StyleSheet} from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  MediaStream,
} from 'react-native-webrtc';
import DeviceInfo from 'react-native-device-info';
import {useNavigation} from '@react-navigation/native';

const LiveStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const peerConnection = useRef(null);

  const navigation = useNavigation();

  const startStreaming = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    });

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        // Normally, you would send the ICE candidate to the server.
      }
    };
    try {
      const localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      console.log('localStream', localStream);
      setLocalStream(localStream);

      // Push tracks from local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      if (peerConnection.signalingState === 'have-remote-offer') {
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
      }

      // Use the WHIP endpoint to publish the stream

      const response = await fetch(
        'http://192.168.11.57:1985/rtc/v1/whip/?app=live&stream=livestream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        },
      );

      if (!response.ok) {
        throw new Error(`SRS server error: ${response.statusText}`);
      }

      const answerSDP = await response.text();
      if (
        peerConnection.current &&
        peerConnection.current.signalingState !== 'closed'
      ) {
        const answer = {
          type: 'answer',
          sdp: answerSDP,
        };
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer), // Tạo một RTCSessionDescription mới với SDP answer
        );
        setIsStreaming(true);
      } else {
        throw new Error('PeerConnection is closed');
      }
    } catch (error) {
      console.error('Failed to start streaming', error);
      Alert.alert('Error', 'Failed to start streaming: ' + error.message);
    }
  };

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setLocalStream(null);
    setIsStreaming(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {localStream && (
          <View style={{width: 200, height: 300, borderWidth: 1}}>
            <RTCView
              streamURL={localStream?.toURL()}
              objectFit="cover"
              style={styles.video}
            />
          </View>
        )}
      </View>
      <Button
        title={isStreaming ? 'Stop Streaming' : 'Start Streaming'}
        onPress={isStreaming ? stopStreaming : startStreaming}
      />
      <Button
        title={'Play Live'}
        onPress={() => navigation.navigate('PlayLiveStream')}
      />
    </View>
  );
};

export default LiveStream;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

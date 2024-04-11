import React, {useState, useEffect, useRef} from 'react';
import {View, Button, TextInput, Switch, Text, Alert} from 'react-native';
import {RTCView, mediaDevices, RTCPeerConnection} from 'react-native-webrtc';

const PlayLiveStream = () => {
  const [url, setUrl] = useState('');
  const [streamURL, setStreamURL] = useState(null);
  const pcStream = useRef();

  const playStream = async () => {
    pcStream.current = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    });

    const pc = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    });

    try {
      await pc.addTransceiver('audio', {direction: 'recvonly'});
      await pc.addTransceiver('video', {direction: 'recvonly'});

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(
        'http://192.168.11.57:1985/rtc/v1/whep/?app=live&stream=livestream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        },
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const answerSDP = await response.text();

      if (pc && pc.signalingState !== 'closed') {
        const answer = {
          type: 'answer',
          sdp: answerSDP,
        };

        pc.ontrack = event => {
          if (event.streams && event.streams[0]) {
            // event.streams[0]._tracks.forEach(track => {
            //   const {id, kind, label} = track;
            //   const newTrack = new MediaStreamTrack({id, kind, label});
            //   stream.addTrack(newTrack);
            // });
            setStreamURL(event.streams[0]);
          }
        };
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.log('Error', `Failed to play stream: ${error.message}`);
      Alert.alert('Error', `Failed to play stream: ${error.message}`);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Button title={'Play Stream'} onPress={playStream} />
      {streamURL && (
        <RTCView
          streamURL={streamURL.toURL()}
          style={{width: '100%', height: '100%'}}
        />
      )}
    </View>
  );
};

export default PlayLiveStream;

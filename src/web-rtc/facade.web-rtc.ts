import InCallManager from 'react-native-incall-manager';
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
class FacadeWebRTC {
  createPeerConnection(): RTCPeerConnection {
    console.info('Create PeerConnection');
    const peerConnection = new RTCPeerConnection(
      this.createConfigurationForPeerConnection(),
    );
    return peerConnection;
  }

  monitorRemoteAudioLevels(peerConnection: RTCPeerConnection, onAudioLevelChange: (level: number) => void) {
    setInterval(async () => {
    console.log(peerConnection)
      const stats = await peerConnection.getStats();
      const audioReceivers = Array.from(stats.values()).filter(stat => stat.type === 'inbound-rtp' && stat.mediaType === 'audio');

      if (audioReceivers.length > 0) {
        const audioReceiver = audioReceivers[0];
        const audioLevel = audioReceiver.audioLevel || 0;
        onAudioLevelChange(audioLevel);
      }
    }, 1000); // Check every 1 second (1000 milliseconds)
  }

  async createLocalMediaStream(): Promise<MediaStream> {
    console.info('Create Local MediaStream');
    let isVoiceOnly = true;
    const mediaStream = await mediaDevices.getUserMedia(
      this.createConfigurationForLocalMediaStream(),
    );
    if (isVoiceOnly) {
      let videoTrack = await mediaStream.getVideoTracks()[0];
      videoTrack.enabled = false;
    }
    return mediaStream;
  }

  addLocalMediaStreamToPeerConnection(
    peerConnection: RTCPeerConnection,
    localMediaStream: MediaStream,
  ) {
    console.info('Add Local Media Stream to Peer Connection');
    localMediaStream
      .getTracks()
      .forEach(track => peerConnection.addTrack(track, localMediaStream));
  }

  async createOfferDescriptionForPeerConnection(
    peerConnection: RTCPeerConnection,
  ): Promise<void> {
    console.info('Create Offer Description');
    const offerDescription = await peerConnection.createOffer(
      this.createConfigurationForSessionPeerConnection,
    );
    await peerConnection.setLocalDescription(offerDescription);
  }

  createRemoteMediaStream(): MediaStream {
    console.info('Create Remote Media Stream');
    return new MediaStream(undefined);
  }

  async createLocalAnswerDescriptionForPeerConnection(
    peerConnection: RTCPeerConnection,
    remoteOfferDescription: string,
  ): Promise<void> {
    console.info('Create Answer Description For Peer Connection');
    const sessionDescription = new RTCSessionDescription(
      JSON.parse(remoteOfferDescription),
    );
    await peerConnection.setRemoteDescription(sessionDescription);
    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);
  }

  async processCandidates(
    peerConnection: RTCPeerConnection,
    iceCandidates: string[],
  ): Promise<void> {
    console.info('Process Candidates');
    if (iceCandidates.length < 1) {
      return;
    }
    await iceCandidates.map(
      async candidate =>
        await peerConnection.addIceCandidate(JSON.parse(candidate)),
    );
  }

  async registerRemoteAnswerDescriptionForPeerConnection(
    peerConnection: RTCPeerConnection,
    answerDescription: string,
  ): Promise<void> {
    try {
      console.info('Register Remote Answer Description For Peer Connection');
      await peerConnection.setRemoteDescription(JSON.parse(answerDescription));
    } catch (error) {
      console.error(error);
    }
  }

  removeLocalMediaStream(localMediaStream: MediaStream) {
    console.info('Remove Local MediaStream');
    localMediaStream.getTracks().forEach(track => track.stop());
  }

  removePeerConnection(peerConnection: RTCPeerConnection) {
    console.info('Remove Peer Connection');
    peerConnection.close();
  }

  async toggleMicrophone(mediaStream: MediaStream): Promise<void> {
    if (mediaStream) {
      const audioTrack = await mediaStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  async toggleSpeaker(isEnabledSpeaker: boolean): Promise<void> {
    InCallManager.setForceSpeakerphoneOn(isEnabledSpeaker);
  }

  private createConfigurationForLocalMediaStream() {
    return {
      audio: true,
      video: {
        frameRate: 30,
        facingMode: 'user',
      },
    };
  }

  private createConfigurationForPeerConnection() {
    return {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    };
  }

  private createConfigurationForSessionPeerConnection() {
    return {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    };
  }
}

export default new FacadeWebRTC();

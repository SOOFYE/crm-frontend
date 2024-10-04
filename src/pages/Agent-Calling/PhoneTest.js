import React, { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import './PhoneTest.css';
import { io } from 'socket.io-client';

function PhoneTest() {
  const [device, setDevice] = useState(null);
  const [callStatus, setCallStatus] = useState('Not started');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [availableInputDevices, setAvailableInputDevices] = useState([]);
  const [availableOutputDevices, setAvailableOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  const [socket, setSocket] = useState(null);

  // Request permission for microphone access before initializing Twilio Device
  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Permission granted');
      initializeTwilioDevice();  // Initialize device after permission is granted
    } catch (error) {
      console.error('Permission denied:', error);
      setCallStatus('Permission denied for microphone access');
    }
  };

  // Initialize Twilio Device
  const initializeTwilioDevice = async () => {
    try {
      const response = await fetch('http://localhost:8000/twilio/token');  // Update with your backend
      const data = await response.json();
      const token = data.token;

      const twilioDevice = new Device(token);

      // Check for output device selection support
      if (twilioDevice.audio.isOutputSelectionSupported) {
        const outputDevices = Array.from(twilioDevice.audio.availableOutputDevices.values());
        if (outputDevices.length > 0) {
          console.log('Available output devices:', outputDevices);
          twilioDevice.audio.speakerDevices.set(outputDevices[0].deviceId);
        } else {
          console.warn('No available output devices found.');
        }
      } else {
        console.warn('Output device selection is not supported in this browser.');
      }

      twilioDevice.on('ready', () => {
        setCallStatus('Device ready');
        console.log('Twilio Device ready');
      });

      twilioDevice.on('connect', () => {
        setCallStatus('Call connected');
        console.log('Call connected');
      });

      twilioDevice.on('connect', () => {
        setCallStatus('Call connected');
        console.log('Call connected');
      });

      twilioDevice.on('disconnect', () => {
        setCallStatus('Call disconnected');
        console.log('Call disconnected');
      });

      twilioDevice.on('error', (error) => {
        setCallStatus(`Error: ${error.message}`);
        console.error('Twilio error:', error);
      });

      // Listen for device changes
      twilioDevice.audio.on('deviceChange', () => {
        const updatedInputDevices = Array.from(twilioDevice.audio.availableInputDevices.values());
        const updatedOutputDevices = Array.from(twilioDevice.audio.availableOutputDevices.values());

        setAvailableInputDevices(updatedInputDevices);
        setAvailableOutputDevices(updatedOutputDevices);
      });

      setDevice(twilioDevice);  // Set Twilio device after initialization
    } catch (error) {
      console.error('Failed to initialize Twilio device:', error);
      setCallStatus('Error initializing Twilio device');
    }
  };

  // Start the call
  const startCall = () => {
    if (device && phoneNumber) {
      const audioContext = device.audio.context;
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed');
        });
      }

      const params = { To: '+923303733837' };  // Pass the customer phone number
      const connection =  device.connect({
        params: {
          From: 'niga',
          To: '+923303733837'
        }
      });

      console.log(connection.status())

      console.log(connection)

      

        setCallStatus('Dialing...');

    } else {
      alert('Twilio device not ready or phone number missing');
    }
  };

  // Change input device
  const changeInputDevice = async (deviceId) => {
    if (device) {
      await device.audio.setInputDevice(deviceId);
      setSelectedInputDevice(deviceId);
      console.log(`Input device set to: ${deviceId}`);
    }
  };

  // Change output device
  const changeOutputDevice = async (deviceId) => {
    if (device) {
      await device.audio.speakerDevices.set(deviceId);
      setSelectedOutputDevice(deviceId);
      console.log(`Output device set to: ${deviceId}`);
    }
  };

  useEffect(() => {
    requestMediaPermissions();  // Ask for media permissions when the component loads
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);
    newSocket.on('callStatus', (statusUpdate) => {
      setCallStatus(statusUpdate.status);
    });
  }, []);

  return (
    <div className="App">
      <h1>Twilio Call Test</h1>
      <div className="call-container">
        <input
          type="text"
          placeholder="Enter customer phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={startCall} disabled={!device}>Start Call</button>
        <p>Call Status: {callStatus}</p>

        {/* Input device selection */}
        <div>
          <h3>Select Input Device (Microphone)</h3>
          <select onChange={(e) => changeInputDevice(e.target.value)} value={selectedInputDevice}>
            {availableInputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ID: ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        {/* Output device selection */}
        <div>
          <h3>Select Output Device (Speaker)</h3>
          <select onChange={(e) => changeOutputDevice(e.target.value)} value={selectedOutputDevice}>
            {availableOutputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ID: ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default PhoneTest;
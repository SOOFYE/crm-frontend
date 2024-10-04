import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'; // Import Socket.io client

function CallButton() {
  const [device, setDevice] = useState(null);
  const [callStatus, setCallStatus] = useState('Not started');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [socket, setSocket] = useState(null);

  // Set up Socket.io connection and listen for call status updates
  useEffect(() => {
    const newSocket = io('http://localhost:8000'); // Replace with your backend URL
    setSocket(newSocket);

    // Listen for status updates from the backend
    newSocket.on('callStatusUpdate', (status) => {
      setCallStatus(status);  // Update call status in real-time
    });

    return () => {
      newSocket.close();  // Clean up the socket on component unmount
    };
  }, []);

  const startCall = async () => {
    if (!phoneNumber) {
      setCallStatus('Please enter a valid phone number');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/twilio/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerNumber: phoneNumber, // Enter the customer phone number
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCallStatus('Call initiated');
      } else {
        setCallStatus('Failed to initiate call');
      }
    } catch (error) {
      setCallStatus('Error initiating call');
      console.error('Call initiation error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Twilio Call Test</h1>
      <p>Call Status: {callStatus}</p>
      <input
        type="text"
        placeholder="Enter customer phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={startCall}>Start Call</button>

      {/* Display status updates */}
      <div>
        <h3>Call Status Updates</h3>
        <p>{callStatus}</p>  {/* This will update based on the socket events */}
      </div>
    </div>
  );
}

export default CallButton;
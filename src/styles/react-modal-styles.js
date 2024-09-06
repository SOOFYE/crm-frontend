export const MODALcustomStyles = {
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',  // Background color of the modal
      padding: '20px',          // Inner padding of the modal
      borderRadius: '8px',      // Rounded corners
      border: '1px solid #ccc', // Border around the modal
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Box shadow for depth
      width: 'auto',
      minWidth: '300px',        // Minimum width
      maxWidth: '90vw',         // Maximum width (90% of viewport width)
      maxHeight: 'fit-content',        // Maximum height (90% of viewport height)
      overflowY: 'auto',        // Scroll if content exceeds max height
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay background with transparency
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
  
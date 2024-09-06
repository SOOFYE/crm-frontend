export const TABLEcustomStyles = {
  table: {
    style: {
      width: '100%', // Ensure table takes full width of the container
      height: '100vh'
    },
  },
  headRow: {
    style: {
      backgroundColor: '#f3f4f6', // Tailwind's gray-100 color
    },
  },
  headCells: {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      whiteSpace: 'normal', // Allow wrapping in the header cells
    },
  },
  rows: {
    style: {
      minHeight: '56px', // Adjust row height for better responsiveness
      '&:not(:last-of-type)': {
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: '#e5e7eb', // Tailwind's gray-300 color
      },
    },
  },
  cells: {
    style: {
      padding: '12px', // Adjust cell padding for smaller screens
      whiteSpace: 'normal', // Allow text wrapping in the cells
      overflow: 'visible', // Ensure content is visible
      textOverflow: 'clip', // Prevent truncation with ellipsis
    },
  },
};

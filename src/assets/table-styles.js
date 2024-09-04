// src/styles/dataTableStyles.js
export const customStyles = {
    table: {
      style: {
        height: '700px',
        width: '100%',
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
        minHeight: '72px', // Override the row height
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: '#e5e7eb', // Tailwind's gray-300 color
        },
      },
    },
    cells: {
      style: {
        padding: '12px', // Cell padding
        whiteSpace: 'normal', // Allow text wrapping in the cells
        overflow: 'visible', // Ensure content is visible
        textOverflow: 'clip', // Prevent truncation with ellipsis
      },
    },
  };
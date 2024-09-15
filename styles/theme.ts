import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  typography: {
    fontFamily: 'Kanit, sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
  },
});

export default theme;

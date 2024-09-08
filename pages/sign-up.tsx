// Example for SignUP.tsx
import React from 'react';
import { TextField, Button } from '@mui/material';

const SignUP = () => {
  return (
    <div>
      <h1>สร้างบัญชี</h1>
      <form>
        <TextField label="Email" variant="outlined" fullWidth />
        <TextField label="Password" type="password" variant="outlined" fullWidth />
        <Button variant="contained" color="primary">สร้างบัญชี</Button>
      </form>
    </div>
  );
};

export default SignUP;
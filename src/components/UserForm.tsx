// src/components/UserForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import api from '../services/api';

const UserForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', { email, name });
      setEmail('');
      setName('');
      // Optionally, trigger a refresh of the user list
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </Box>
  );
};

export default UserForm;
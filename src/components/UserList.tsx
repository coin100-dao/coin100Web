// src/components/UserList.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>('/users');
        const usersWithNumberId = response.data.map((user) => ({
          ...user,
          id: Number(user.id),
        }));
        setUsers(usersWithNumberId);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.id.toString()}>
            <ListItemText
              primary={user.name || 'No Name'}
              secondary={user.email}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default UserList;

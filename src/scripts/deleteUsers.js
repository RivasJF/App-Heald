import axios from 'axios';

export const deleteUsers = async () => {
  try {
    const response = await axios.delete('https://server-heald.onrender.com/');
    console.log('Users deleted successfully:', response.data);
  } catch (error) {
    console.error('Error deleting users:', error.message);
  }
};

deleteUsers();

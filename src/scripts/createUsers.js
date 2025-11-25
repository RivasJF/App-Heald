import axios from "axios";

export async function createUsers() {
  const userNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
  for (const name of userNames) {
    try {
      const response = await axios.post('https://server-heald.onrender.com/', { name });
      console.log('User created:', response.data);
    } catch (error) {
      console.error('Error creating user:', name, error);
    }
  }
}


createUsers();

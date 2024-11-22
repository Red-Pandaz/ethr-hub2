# Ethr Hub

## Project Description

This repository was created to fulfill the requirements of the Per Scholas capstone project. It is a simplified Reddit clone that uses **Ethereum** for user authentication. The project is currently deployed at [ethrhub.xyz](https://ethrhub.xyz).

---

## How to Use

1. **Authentication**  
   - Unauthenticated users will be prompted to sign in using **MetaMask**.  
   - Returning users have their accounts stored in the database.  
   - New users are automatically added to the database upon their initial login. During account creation, the program checks **ENS (Ethereum Name Service)** for names that resolve to the authenticated address.  
   - Wherever applicable, ENS names are displayed in place of their resolved Ethereum addresses on the website.

2. **Session and Access**  
   - Once logged in, users receive a **JWT** that grants browsing and posting access for one hour.

3. **Navigation**  
   - `/channels`: Displays a list of channels available for browsing.  
   - `/channels/:channelId`: Lists all posts within a specific channel in descending order by timestamp. A form is provided to create new posts in that channel.  
   - `/posts/:postId`: Displays the title and content of a post along with all associated comments.  
     - **Post and Comment Management**:  
       - Post creators can edit or delete their posts.  
       - Comment creators can edit or delete their comments.  
       - Deleting a comment automatically removes all of its child comments from the display.

---

## Technologies Used

- **MongoDB**  
- **Express.js**  
- **React.js**  
- **Node.js**  
- **Ethers.js**  
- **Ethereum Name Service (ENS)**  
- **Google Cloud Secrets**  
- **DigitalOcean**

# Protein Master

Protein Master is a React-based web application that allows users to:
- Search for proteins by name or keyword
- View 3D structures of proteins using the [Mol\*](https://molstar.org/) library
- Visualize protein surface data in a custom matrix/heatmap

This is a **prototype** frontend; it does not currently have a backend. The application uses mock or publicly available data (e.g., from RCSB Protein Data Bank) for demonstration purposes.

---

## Features

- **Search Page:** A simple input box where users can type a protein name/keyword.
- **Results Page:** Displays:
  - A 3D structure viewer powered by Mol\*
  - A matrix/heatmap component to visualize protein “surface” or other matrix-based data
  - Basic protein info (name, ID, description, etc.)

## Getting Started

1. **Clone this repository** or download the source code.
2. **Install dependencies** using the command:
   ```bash
   npm install
3. **Run the development server**:
    ```bash
    npm start
4. Open http://localhost:3000 in your browser to see the application.

> To integrate the frontend and backend, you should launch the backend first. For backend, please refer to [link](https://github.com/protein-master-project/protein-master). 

## Key components

1. **SearchPage.js**  
   - A simple component that provides a search input and button. Redirects to the results page when a search is performed.

2. **ResultsPage.js / ResultsPage.css**  
   - **ResultsPage.js**: Displays the main content after a search, including:
     - Protein information (name, ID, description)
     - The MolstarViewer for the 3D structure
     - The MatrixViewer for a “surface” or matrix visualization
   - **ResultsPage.css**: Styles specific to the ResultsPage layout, such as cards or grids.

3. **MolstarViewer.js**  
   - Encapsulates the Mol\* viewer logic for 3D protein visualization.
   - Initializes the viewer in a specified `<div>`, loads a PDB structure from RCSB or another endpoint, and handles cleanup.

4. **MatrixViewer.js / MatrixViewer.css**  
   - **MatrixViewer.js**: A simple component that renders a 2D matrix/heatmap. It maps numeric values to colors (e.g., blue to red gradient).
   - **MatrixViewer.css**: Styles for the matrix layout, cells, and any hover effects.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

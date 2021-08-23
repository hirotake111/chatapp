import Home from "./pages/Home/Home";
import LoadingSpinner from "./components/LoadingSpinner";

export default function App({
  user: { isAuthenticated },
}: {
  user: { isAuthenticated: boolean };
}) {
  /**
   * App component will display Home if the user is authenticated,
   * otherwise display a loading spinner
   */
  return (
    <div className="App">{isAuthenticated ? <Home /> : <LoadingSpinner />}</div>
  );
}

import { useEffect, useState } from "react";
import "./App.css";

const FOOD_KEY = "foodPosts";
const CLAIM_KEY = "foodClaims";

function readStorage(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function statusClass(status) {
  if (status === "Available") return "available";
  if (status === "Rejected") return "rejected";
  if (status === "Claimed") return "claimed";
  return "pending";
}

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function App() {
  const [page, setPage] = useState("home");
  const [foods, setFoods] = useState(() => readStorage(FOOD_KEY));
  const [claims, setClaims] = useState(() => readStorage(CLAIM_KEY));
  const [message, setMessage] = useState("");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [donor, setDonor] = useState({
    donorName: "", foodName: "", phone: "", quantity: "", location: "", expiry: ""
  });
  const [recipient, setRecipient] = useState({
    name: "", phone: "", location: ""
  });

  useEffect(() => {
    localStorage.setItem(FOOD_KEY, JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem(CLAIM_KEY, JSON.stringify(claims));
  }, [claims]);

  const updateDonor = (event) =>
    setDonor({ ...donor, [event.target.name]: event.target.value });

  const updateRecipient = (event) =>
    setRecipient({ ...recipient, [event.target.name]: event.target.value });

  function submitFood(event) {
    event.preventDefault();
    if (Object.values(donor).some((value) => !value.trim())) {
      setMessage("Please fill all food details.");
      return;
    }
    const newFood = {
      id: Date.now(),
      ...donor,
      status: "Pending Admin Verification",
      recipientName: "",
      recipientPhone: "",
      recipientLocation: "",
      claimStatus: "Not Claimed"
    };
    setFoods((current) => [...current, newFood]);
    setDonor({ donorName: "", foodName: "", phone: "", quantity: "", location: "", expiry: "" });
    setMessage("Food details sent to Admin successfully! 🍱");
  }

  function adminLogin(event) {
    event.preventDefault();
    // Demo-only credentials. Use server-side authentication in a real application.
    if (login.username === "Isaac" && login.password === "Daniel@9390") {
      setPage("admin");
      setMessage("");
      setLogin({ username: "", password: "" });
    } else {
      setMessage("❌ Invalid Admin Username or Password");
    }
  }

  function updateFood(id, status) {
    setFoods((current) =>
      current.map((food) =>
        food.id === id
          ? { ...food, status, claimStatus: status === "Available" ? "Not Claimed" : food.claimStatus }
          : food
      )
    );
    setMessage(status === "Available" ? "Food Verified Successfully! ✅" : "Food Rejected Successfully! ❌");
  }

  function claimFood(food) {
    if (!recipient.name.trim() || !recipient.phone.trim() || !recipient.location.trim()) {
      setMessage("Please enter your name, phone number, and location before claiming food.");
      return;
    }
    if (food.status !== "Available" || food.claimStatus === "Claimed") {
      setMessage("Sorry, this food is no longer available.");
      return;
    }
    const claim = {
      id: Date.now(),
      foodId: food.id,
      foodName: food.foodName,
      donorName: food.donorName,
      quantity: food.quantity,
      recipientName: recipient.name.trim(),
      recipientPhone: recipient.phone.trim(),
      recipientLocation: recipient.location.trim(),
      claimedAt: new Date().toISOString()
    };
    setClaims((current) => [...current, claim]);
    setFoods((current) =>
      current.map((item) =>
        item.id === food.id
          ? {
              ...item,
              status: "Claimed",
              claimStatus: "Claimed",
              recipientName: claim.recipientName,
              recipientPhone: claim.recipientPhone,
              recipientLocation: claim.recipientLocation
            }
          : item
      )
    );
    setMessage(`You successfully claimed ${food.foodName}. 📦`);
  }

  const availableFoods = foods.filter(
    (food) => food.status === "Available" && food.claimStatus !== "Claimed"
  );
  const myClaims = claims.filter(
    (claim) =>
      recipient.name.trim() &&
      claim.recipientName.toLowerCase() === recipient.name.trim().toLowerCase() &&
      (!recipient.phone.trim() || claim.recipientPhone === recipient.phone.trim())
  );

  function goTo(nextPage) {
    setMessage("");
    setPage(nextPage);
  }

  function FoodCard({ food, children }) {
    return (
      <article className="food-card" key={food.id}>
        <h3>🍱 {food.foodName}</h3>
        <p><b>Donor:</b> {food.donorName}</p>
        {food.phone && <p><b>Phone:</b> {food.phone}</p>}
        <p><b>Quantity:</b> {food.quantity}</p>
        <p><b>Location:</b> {food.location}</p>
        <p><b>Expiry:</b> {formatDate(food.expiry)}</p>
        <p><b>Status:</b> <span className={`status ${statusClass(food.status)}`}>{food.status}</span></p>
        {food.claimStatus === "Claimed" && (
          <div className="info">
            <b>📦 Food claimed by recipient</b>
            <p><b>Name:</b> {food.recipientName}</p>
            <p><b>Phone:</b> {food.recipientPhone}</p>
            <p><b>Location:</b> {food.recipientLocation}</p>
          </div>
        )}
        {children}
      </article>
    );
  }

  return (
    <>
      <header>
        <h1>🍲 Food Waste Management System</h1>
        <p>Reduce Food Waste • Help People in Need</p>
      </header>

      {message && (
        <div className="message" role="status">
          <span>{message}</span>
          <button className="message-close" onClick={() => setMessage("")} aria-label="Dismiss message">×</button>
        </div>
      )}

      {page === "home" && (
        <main className="container">
          <section className="panel home-panel">
            <h2>Welcome to FoodShare</h2>
            <p>Choose your portal</p>
            <div className="home-actions">
              <button onClick={() => goTo("donor")}>👤 Donor Portal</button>
              <button className="recipient-btn" onClick={() => goTo("recipient")}>👥 Recipient Portal</button>
              <button className="admin-btn" onClick={() => goTo("adminLogin")}>🔐 Admin Portal</button>
            </div>
          </section>
        </main>
      )}

      {page === "donor" && (
        <main className="container">
          <section className="panel">
            <h2>👤 Donor Portal</h2>
            <p>Anyone can submit surplus food details.</p>
            <form onSubmit={submitFood}>
              <label>Donor Name<input name="donorName" value={donor.donorName} onChange={updateDonor} placeholder="Donor Name" /></label>
              <label>Food Name<input name="foodName" value={donor.foodName} onChange={updateDonor} placeholder="Food Name" /></label>
              <label>Phone Number<input name="phone" type="tel" value={donor.phone} onChange={updateDonor} placeholder="Phone Number" /></label>
              <label>Quantity<input name="quantity" value={donor.quantity} onChange={updateDonor} placeholder="Quantity (Example: 20 plates)" /></label>
              <label>Pickup Location<input name="location" value={donor.location} onChange={updateDonor} placeholder="Pickup Location" /></label>
              <label>Expiry Date &amp; Time<input name="expiry" type="datetime-local" value={donor.expiry} onChange={updateDonor} /></label>
              <button type="submit">🍱 Submit Food</button>
              <button type="button" className="logout" onClick={() => goTo("home")}>← Back</button>
            </form>
          </section>
          <section className="panel">
            <h2>📋 My Submitted Food</h2>
            {foods.length === 0 ? <p>No food submitted yet.</p> : foods.map((food) => (
              <FoodCard food={food} key={food.id} />
            ))}
          </section>
        </main>
      )}

      {page === "adminLogin" && (
        <main className="container">
          <section className="panel narrow">
            <h2>🔐 Admin Login</h2>
            <form onSubmit={adminLogin}>
              <label>Admin Username<input value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} placeholder="Admin Username" autoComplete="username" /></label>
              <label>Admin Password<input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Admin Password" autoComplete="current-password" /></label>
              <button type="submit">Login</button>
              <button type="button" className="logout" onClick={() => goTo("home")}>← Back</button>
            </form>
            <p className="hint">Demo login: username <b>Isaac</b>, password <b>Daniel@9390</b></p>
          </section>
        </main>
      )}

      {page === "admin" && (
        <main className="container">
          <section className="panel">
            <h2>👨‍💼 Admin Dashboard</h2>
            <p>Welcome Admin, <b>Isaac</b></p>
            <button className="logout" onClick={() => goTo("home")}>Logout</button>
          </section>
          <section className="panel">
            <h2>👥 Donor Management</h2>
            <p>Food submitted by donors appears here.</p>
            <button onClick={() => setMessage(`Food posts refreshed. Total posts: ${foods.length}`)}>🔄 Refresh Food Posts</button>
            {foods.length === 0 ? <p>No food has been submitted by donors.</p> : foods.map((food) => (
              <FoodCard food={food} key={food.id}>
                {food.status === "Pending Admin Verification" && (
                  <div className="card-actions">
                    <button onClick={() => updateFood(food.id, "Available")}>✅ Verify Food</button>
                    <button className="reject" onClick={() => updateFood(food.id, "Rejected")}>❌ Reject Food</button>
                  </div>
                )}
              </FoodCard>
            ))}
          </section>
          <section className="panel">
            <h2>👥 Recipient Management</h2>
            <p>Admin can see which recipient claimed which food.</p>
            <button onClick={() => setMessage(`Recipient claims refreshed. Total claims: ${claims.length}`)}>🔄 Refresh Recipient Claims</button>
            {claims.length === 0 ? <p>No food claims yet.</p> : claims.map((claim) => (
              <article className="food-card" key={claim.id}>
                <h3>📦 {claim.foodName}</h3>
                <p><b>Recipient:</b> {claim.recipientName}</p>
                <p><b>Phone:</b> {claim.recipientPhone}</p>
                <p><b>Location:</b> {claim.recipientLocation}</p>
                <p><b>Quantity:</b> {claim.quantity}</p>
                <p><b>Claimed at:</b> {formatDate(claim.claimedAt)}</p>
              </article>
            ))}
          </section>
        </main>
      )}

      {page === "recipient" && (
        <main className="container">
          <section className="panel">
            <h2>👥 Recipient Portal</h2>
            <p>View food verified by Admin and claim available food.</p>
            <div className="form-grid">
              <label>Recipient Name<input name="name" value={recipient.name} onChange={updateRecipient} placeholder="Recipient Name" /></label>
              <label>Recipient Phone Number<input name="phone" type="tel" value={recipient.phone} onChange={updateRecipient} placeholder="Recipient Phone Number" /></label>
              <label>Recipient Location<input name="location" value={recipient.location} onChange={updateRecipient} placeholder="Recipient Location" /></label>
            </div>
            <button onClick={() => setMessage(`${availableFoods.length} verified food post(s) currently available.`)}>🔄 View Available Food</button>
            <button className="logout" onClick={() => goTo("home")}>← Back</button>
          </section>
          <section className="panel">
            <h2>🍱 Available Food</h2>
            {availableFoods.length === 0 ? <p>No verified food is currently available.</p> : availableFoods.map((food) => (
              <FoodCard food={food} key={food.id}>
                <button className="claim" onClick={() => claimFood(food)}>📦 Claim Food</button>
              </FoodCard>
            ))}
          </section>
          <section className="panel">
            <h2>📦 My Claims</h2>
            {myClaims.length === 0 ? <p>No food claimed yet for these recipient details.</p> : myClaims.map((claim) => (
              <article className="food-card" key={claim.id}>
                <h3>🍱 {claim.foodName}</h3>
                <p><b>Quantity:</b> {claim.quantity}</p>
                <p><b>Pickup location:</b> {foods.find((food) => food.id === claim.foodId)?.location || "Not available"}</p>
                <p><b>Claimed at:</b> {formatDate(claim.claimedAt)}</p>
              </article>
            ))}
          </section>
        </main>
      )}

      <footer>FoodShare • Share surplus food, reduce waste, support your community.</footer>
    </>
  );
}

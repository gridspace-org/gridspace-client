import axios from "axios";

async function testBooking() {
  try {
    // First login to get a token
    const loginResponse = await axios.post(
      "http://localhost:5002/api/v1/auth/signin",
      {
        email: "testuser2@example.com",
        password: "Password123!",
      }
    );

    console.log("Login response:", loginResponse.data);

    const token = loginResponse.data.data.tokens.accessToken;
    if (!token) {
      throw new Error("No token received from login");
    }
    console.log("✅ Login successful, token received");

    // Test booking creation
    const bookingData = {
      spaceId: "6919a7c99cf4ccabdafa5e03",
      startTime: "2025-12-22T10:00:00.000Z",
      endTime: "2025-12-22T12:00:00.000Z",
      guestCount: 2,
    };

    console.log("📝 Creating booking with data:", bookingData);

    const bookingResponse = await axios.post(
      "http://localhost:5002/api/v1/bookings",
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Booking created successfully:", bookingResponse.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
    console.error("Full error:", error);
  }
}

testBooking();

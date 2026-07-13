import React, { useState } from "react";
import axios from "axios";

const ReviewModal = ({ restaurantId }) => {
  const [show, setShow] = useState(false);

  const [name, setName] = useState("");

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const submitReview = async () => {
    if (!name || !comment) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.put(
        `/api/v1/ai/stores/${restaurantId}/review`,
        {
          name,
          rating: Number(rating),
          Comment: comment,
        },
        {
          withCredentials: true,
        }
      );

      alert("Review Added Successfully!");

      setShow(false);

      setName("");

      setRating(5);

      setComment("");

      // Refresh page so AI summary updates
      window.location.reload();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to add review"
      );
    }
  };

  return (
    <>
      <button
        className="btn btn-warning mb-3"
        onClick={() => setShow(true)}
      >
        ⭐ Write Review
      </button>

      {show && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "420px",
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
            }}
          >
            <h3>Add Review</h3>

            <input
              className="form-control mb-3"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <select
              className="form-control mb-3"
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
            >
              <option value="5">5 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="1">1 ⭐</option>
            </select>

            <textarea
              rows="5"
              className="form-control mb-3"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
            />

            <button
              className="btn btn-success me-2"
              onClick={submitReview}
            >
              Submit
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewModal;
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import ReviewModal from "./ReviewModal";
import api from "../utils/api";

import {
  getMenus,
  addItemToMenu,
  createMenu,
} from "../redux/actions/menuActions";

import { getRestaurants } from "../redux/actions/restaurantAction";

import Fooditem from "./Fooditem";

const Menu = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    menus,
    menuId,
    loading,
    error,
    addError,
  } = useSelector((state) => state.menus);

  const { isAuthenticated, user } = useSelector(
    (state) => state.user
  );

  const [showMenuCreate, setShowMenuCreate] =
    useState(false);

  const [newMenuCategory, setNewMenuCategory] =
    useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [itemToAdd, setItemToAdd] = useState({
    category: "",
    foodItemId: "",
  });

  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    imageUrl: "",

    aiDescription: "",
    aiTags: [],
    aiAllergens: [],
    aiServes: "",
    aiBestFor: [],
  });

  useEffect(() => {
    dispatch(getMenus(id));
    dispatch(getRestaurants());
  }, [dispatch, id]);

  // ======================================================
  // CREATE MENU
  // ======================================================

  const submitMenuCreation = async (e) => {
    e.preventDefault();

    if (!newMenuCategory.trim()) {
      return;
    }

    const result = await dispatch(
      createMenu({
        restaurantId: id,
        category: newMenuCategory,
      })
    );

    if (createMenu.fulfilled.match(result)) {
      dispatch(getMenus(id));

      setShowMenuCreate(false);
      setNewMenuCategory("");
    }
  };

  // ======================================================
  // CREATE FOOD ITEM
  // ======================================================

  const submitNewFood = async () => {
    try {
      const payload = {
        ...newFood,
        price: Number(newFood.price) || 0,
        stock: Number(newFood.stock) || 0,
        restaurant: id,
      };

      const { data } = await api.post(
        "/v1/eats/item",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const createdFoodItem = data.data;

      setNewFood({
        name: "",
        price: "",
        description: "",
        stock: "",
        imageUrl: "",

        aiDescription: "",
        aiTags: [],
        aiAllergens: [],
        aiServes: "",
        aiBestFor: [],
      });

      return createdFoodItem;
    } catch (err) {
      console.error(
        "Unable to create food item:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to create food item"
      );

      return null;
    }
  };

  // ======================================================
  // ADD FOOD ITEM TO MENU
  // ======================================================

  const submitAddItem = async (e) => {
    e.preventDefault();

    const createdFoodItem = await submitNewFood();

    if (!createdFoodItem?._id) {
      return;
    }

    const result = await dispatch(
      addItemToMenu({
        menuId,
        category: itemToAdd.category,
        foodItemId: createdFoodItem._id,
        restaurantId: id,
      })
    );

    if (addItemToMenu.fulfilled.match(result)) {
      dispatch(getMenus(id));

      setShowAddModal(false);

      setItemToAdd({
        category: "",
        foodItemId: "",
      });
    }
  };

  // ======================================================
  // DELETE MENU
  // ======================================================

  const deleteMenu = async (menuIdToDelete) => {
    const shouldDelete = window.confirm(
      "Delete this menu category?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await api.delete(
        `/v1/eats/stores/${id}/menus/${menuIdToDelete}`
      );

      dispatch(getMenus(id));
    } catch (err) {
      console.error(
        "Unable to delete menu:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete menu"
      );
    }
  };

  // ======================================================
  // GENERATE AI DESCRIPTION
  // ======================================================

  const generateDescription = async () => {
    if (!newFood.name.trim()) {
      alert("Enter name first");
      return;
    }

    try {
      const { data } = await api.post(
        "/v1/ai/generate-food-ai",
        {
          name: newFood.name,
          category: itemToAdd.category || "",
          spiceLevel: "Medium",
          price: Number(newFood.price) || 0,
        }
      );

      setNewFood((previousFood) => ({
        ...previousFood,

        // Normal description shown to customers
        description: data.data.description,

        // AI metadata
        aiDescription: data.data.description,

        aiTags: data.data.tags || [],

        aiAllergens: data.data.allergens || [],

        aiServes: data.data.serves || "",

        aiBestFor: data.data.bestFor || [],
      }));
    } catch (err) {
      console.error(
        "Unable to generate AI description:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to generate description"
      );
    }
  };

  return (
    <div>
      {/* REVIEW BUTTON */}

      {!loading && (
        <div className="mb-4">
          <ReviewModal restaurantId={id} />
        </div>
      )}

      {loading ? (
        <p>Loading menus...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : menus && menus.length > 0 ? (
        menus.map((menu) => (
          <div key={menu._id}>
            <div className="d-flex align-items-center">
              <h2 className="mr-2">
                {menu.category}
              </h2>

              {isAuthenticated &&
                user?.role === "admin" && (
                  <>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setItemToAdd({
                          category: menu.category,
                          foodItemId: "",
                        });

                        setShowAddModal(true);
                      }}
                    >
                      + item
                    </button>

                    <button
                      className="btn btn-sm btn-danger ml-2"
                      onClick={() =>
                        deleteMenu(menu._id)
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
            </div>

            <hr />

            {menu.items &&
            menu.items.length > 0 ? (
              <div className="row">
                {menu.items.map((fooditem) => (
                  <Fooditem
                    key={fooditem._id}
                    fooditem={fooditem}
                    restaurant={id}
                  />
                ))}
              </div>
            ) : (
              <p>No menu items available</p>
            )}
          </div>
        ))
      ) : (
        <p>No menus available</p>
      )}

      {/* ADD MENU BUTTON */}

      {isAuthenticated &&
        user?.role === "admin" && (
          <div className="my-3">
            <button
              className="btn btn-primary"
              onClick={() =>
                setShowMenuCreate(true)
              }
            >
              + Add Menu
            </button>
          </div>
        )}

      {/* CREATE MENU MODAL */}

      {showMenuCreate && (
        <div className="create-modal">
          <div className="create-content">
            <h3>Create Menu Category</h3>

            <form onSubmit={submitMenuCreation}>
              <div className="form-group">
                <label>Category Name</label>

                <input
                  type="text"
                  value={newMenuCategory}
                  onChange={(e) =>
                    setNewMenuCategory(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
              >
                Create
              </button>

              <button
                className="btn btn-secondary ml-2"
                type="button"
                onClick={() =>
                  setShowMenuCreate(false)
                }
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD FOOD ITEM MODAL */}

      {showAddModal && (
        <div className="create-modal">
          <div className="create-content">
            <h3>Add Food Item</h3>

            {addError && (
              <p className="text-danger">
                {addError}
              </p>
            )}

            <form onSubmit={submitAddItem}>
              <div className="form-group">
                <label>Menu Category</label>

                <select
                  value={itemToAdd.category}
                  onChange={(e) =>
                    setItemToAdd(
                      (previousItem) => ({
                        ...previousItem,
                        category: e.target.value,
                      })
                    )
                  }
                  required
                >
                  <option value="">
                    Select
                  </option>

                  {menus.map((menu) => (
                    <option
                      key={menu._id}
                      value={menu.category}
                    >
                      {menu.category}
                    </option>
                  ))}
                </select>
              </div>

              <h5 className="mt-3">
                Create New Food Item
              </h5>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Name"
                  value={newFood.name}
                  onChange={(e) =>
                    setNewFood(
                      (previousFood) => ({
                        ...previousFood,
                        name: e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              <div className="form-group d-flex align-items-center">
                <input
                  type="number"
                  placeholder="Price"
                  value={newFood.price}
                  min="0"
                  onChange={(e) =>
                    setNewFood(
                      (previousFood) => ({
                        ...previousFood,
                        price: e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              <div className="form-group d-flex align-items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={newFood.description}
                  onChange={(e) =>
                    setNewFood(
                      (previousFood) => ({
                        ...previousFood,
                        description:
                          e.target.value,
                      })
                    )
                  }
                  required
                />

                <button
                  type="button"
                  className="btn btn-sm btn-info ml-2"
                  onClick={generateDescription}
                >
                  AI desc
                </button>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  placeholder="Stock"
                  value={newFood.stock}
                  min="0"
                  onChange={(e) =>
                    setNewFood(
                      (previousFood) => ({
                        ...previousFood,
                        stock: e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newFood.imageUrl}
                  onChange={(e) =>
                    setNewFood(
                      (previousFood) => ({
                        ...previousFood,
                        imageUrl: e.target.value,
                      })
                    )
                  }
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
              >
                Add
              </button>

              <button
                className="btn btn-secondary ml-2"
                type="button"
                onClick={() => {
                  setShowAddModal(false);

                  setItemToAdd({
                    category: "",
                    foodItemId: "",
                  });
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
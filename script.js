// selecting elements
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const icon = hamburger.querySelector("i");
const search = document.getElementById("search");
const searchbtn = document.getElementById("searchbtn");
const main = document.querySelector("main");
const homeBtn = document.querySelector(".home-btn");
const logo = document.querySelector("#logo");

// headings through js
const dynamicHeading = document.createElement("h3");
main.appendChild(dynamicHeading);

const dynamicResults = document.createElement("div");
dynamicResults.className = "results";
main.appendChild(dynamicResults);

// category description container
const categoryDescription = document.createElement("div");
categoryDescription.className = "category-description";
main.insertBefore(categoryDescription, dynamicResults);

// Categories section
const categoriesHeading = document.createElement("h3");
categoriesHeading.textContent = "Categories";
main.appendChild(categoriesHeading);

const categoriesResults = document.createElement("div");
categoriesResults.className = "results";
main.appendChild(categoriesResults);

// Global variable to store all categories
let allCategories = [];

// API calls (NO try/catch)
const getCategories = async () => {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
    const data = await res.json();
    return data.categories;
};

const searchMeal = async (name) => {
    const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
    );
    return await res.json();
};

const filterByCategory = async (category) => {
    const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    return await res.json();
};

const getMealDetails = async (id) => {
    const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    return await res.json();
};

// Display category description
const showCategoryDescription = (categoryName) => {
    const category = allCategories.find(
        (cat) => cat.strCategory === categoryName
    );
    if (!category) return;

    categoryDescription.innerHTML = `
        <h3>${category.strCategory}</h3>
        <p>${category.strCategoryDescription}</p>
    `;
    categoryDescription.classList.add("show");
};

// Display categories as cards
const displayCategories = (categories) => {
    categoriesResults.innerHTML = "";
    categories.forEach((cat) => {
        const card = document.createElement("div");
        card.className = "meal-card";
        card.innerHTML = `
            <h4>${cat.strCategory}</h4>
            <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
        `;
        card.onclick = async () => {
            dynamicHeading.textContent = `Category >> ${cat.strCategory}`;
            showCategoryDescription(cat.strCategory);
            const data = await filterByCategory(cat.strCategory);
            displayMeals(data.meals);
        };
        categoriesResults.appendChild(card);
    });
};

// Display meals
const displayMeals = (meals) => {
    dynamicResults.innerHTML = "";
    dynamicResults.classList.remove("meal-details");
    dynamicResults.classList.add("results");

    if (!meals || meals.length === 0) {
        dynamicResults.innerHTML =
            "<h2 style='color:red;'>No meals found</h2>";
        return;
    }

    meals.forEach((meal) => {
        const card = document.createElement("div");
        card.className = "meal-card";
        card.innerHTML = `
            <h4>${meal.strMeal}</h4>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        `;
        card.onclick = () => showMealDetails(meal.idMeal);
        dynamicResults.appendChild(card);
    });
};

// Show meal details
const showMealDetails = async (id) => {
    const data = await getMealDetails(id);
    if (!data.meals) return;

    const meal = data.meals[0];
    dynamicHeading.textContent = meal.strMeal;

    let ingredientsHTML = "";
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const meas = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
            ingredientsHTML += `<li>${meas || ""} ${ing}</li>`;
        }
    }

    const instructionsHTML = meal.strInstructions
        .split(/\r?\n/)
        .filter((s) => s.trim())
        .map((step) => `<li>${step}</li>`)
        .join("");

    const sourceLink =
        meal.strSource && meal.strSource.startsWith("http")
            ? `<a href="${meal.strSource}" target="_blank">${meal.strSource}</a>`
            : "";

    dynamicResults.classList.remove("results");
    dynamicResults.classList.add("meal-details");

    dynamicResults.innerHTML = `
        <div class="meal-top">
            <div class="meal-image">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
            <div class="meal-info-box">
                <div class="meal-info">
                    <h2>${meal.strMeal}</h2>
                    <p><strong>Category &gt;&gt;</strong> ${meal.strCategory}</p>
                    ${sourceLink ? `<p><strong>Source:</strong> ${sourceLink}</p>` : ""}
                </div>
                <div class="meal-ingredients-box">
                    <h4>Ingredients & Measures</h4>
                    <ul>${ingredientsHTML}</ul>
                </div>
            </div>
        </div>
        <div class="meal-bottom">
            <h4>Instructions</h4>
            <ol>${instructionsHTML}</ol>
        </div>
    `;
};

// Show menu
const showMenu = async () => {
    allCategories = await getCategories();
    menu.innerHTML = `
        <ul>
            ${allCategories
                .map(
                    (cat) =>
                        `<li><a href="#" data-category="${cat.strCategory}">
                            ${cat.strCategory}
                        </a></li>`
                )
                .join("")}
        </ul>
    `;
    displayCategories(allCategories);
};

// Hamburger toggle
hamburger.onclick = async () => {
    menu.classList.toggle("active");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
    if (!menu.innerHTML) await showMenu();
};

// Menu click
menu.onclick = async (e) => {
    if (!e.target.dataset.category) return;
    e.preventDefault();

    const category = e.target.dataset.category;
    dynamicHeading.textContent = `Category >> ${category}`;
    showCategoryDescription(category);

    const data = await filterByCategory(category);
    displayMeals(data.meals);

    menu.classList.remove("active");
    icon.classList.add("fa-bars");
    icon.classList.remove("fa-xmark");
};

// Search
searchbtn.onclick = async (e) => {
    e.preventDefault();
    const value = search.value.trim();
    if (!value) return;

    dynamicHeading.textContent = `Search results for "${value}"`;
    categoryDescription.innerHTML = "";
    categoryDescription.classList.remove("show");

    const data = await searchMeal(value);
    displayMeals(data.meals);
};

// Home
homeBtn.onclick = async (e) => {
    e.preventDefault();
    dynamicHeading.textContent = "";
    dynamicResults.innerHTML = "";
    categoryDescription.innerHTML = "";
    categoryDescription.classList.remove("show");
    search.value = "";
    await showMenu();
};

// Logo
logo.addEventListener("click", async (e) => {
    e.preventDefault();
    dynamicHeading.textContent = "";
    dynamicResults.innerHTML = "";
    categoryDescription.innerHTML = "";
    categoryDescription.classList.remove("show");
    search.value = "";
    await showMenu();
});

// Initial load
showMenu();

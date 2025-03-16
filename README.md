# HACKUAB - UABTHEHACK | Hackathon 2025
[Página Web](https://www.uabthehack.cat/)

## Project Requisites
[PayRetailers Info](https://bitbucket.org/payretailers/uab-the-hack-payretailers/src/main/)

## Project Description
This project is part of a challenge from PayRetailers to use AI in a fair usage way, as well as providing value to people, specially from Latinoamérica.

Our project implementation followed a two way solution.
- First, we implemented a RAG AI Agent cappable of gathering all the dataset data from the PayRetailers websites and keep a Vector Store with Embeggins up to date. It can provide specific responses to anything asked about PayRetailers, using the information from the company as context.

- In addition, we implemented a Buy Agent integrated with the PayRetailers sandbox payment API cappable of helping users buy any product from any e-commerce store.

Both the Chat Agent and the Buy Agent are made available through a JavaScript code snippet, which communicates with the main API, which communicates with OpenAI & the client to provides the responses and display them to the end user.

# Requeriments
Clone the `.env.example` and populate it with your environment api keys and variables.

## Execute the APP
To run the main API: `npm run start`
To run the crawler and extract the dataset: `npm run crawl`

## Project Structure
- `dataset`: Will contain all the dataset for the Vector Store, provided by the crawler
- `src/`: Contains all the code for the Agent API
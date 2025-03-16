# HACKUAB - UABTHEHACK | Hackathon 2025
[Página Web](https://www.uabthehack.cat/)

- Start: 15/03/2025 at 12:00
- End: 16/03/2025 at 12:00
- Team Members: Genís Carretero Ferrete & Pau Serrat Gutiérrez

## Project Requisites
[PayRetailers Info](https://bitbucket.org/payretailers/uab-the-hack-payretailers/src/main/)

## Project Description
This project is part of a challenge from PayRetailers to use AI in a fair usage way, as well as providing value to people, specially from Latinoamérica.

Our project implementation followed a two way solution.
- First, we implemented a RAG AI Agent cappable of gathering all the dataset data from the PayRetailers websites and keep a Vector Store with Embeggins up to date. It can provide specific responses to anything asked about PayRetailers, using the information from the company as context.

- In addition, we implemented a Buy Agent integrated with the PayRetailers sandbox payment API cappable of helping users buy any product from any e-commerce store. It uses an OpenAI LLM to analyse a screenshot and provide the details from it to generate the sandbox payment link from PayRetailers.

Both the Chat Agent and the Buy Agent are made available through a JavaScript code snippet, which communicates with the main API, which communicates with OpenAI & the client to provides the responses and display them to the end user.

## Requeriments
Clone the `.env.example` and populate it with your environment api keys and variables.

## Project Structure
- `dataset`: Will contain all the dataset for the Vector Store, provided by the crawler
- `src/`: Contains all the code for the Agent API, organized. Using a model - controller approach.
- `frontend` contains the JS code snippet

## Execute the APP
1. To run the main API:
- `npm run start`. This will open the API on `https://localhost` (using specified port from `.env`)
- Open any website (chrome preferible). Open Developer Tools -> Console and paste the JS from the `frontend/chat.js` folder.
- The chat bubble will appear on the bottom right corner of the website. It will automatically connect to the API, and do the dataset sync to have the most up to date vector store with the dataset files. It uses GitHub sha hashes and sha hashes stored in the vector store files to optimize vector store syncing and improve responses and costs.

2. To run the crawler and extract the dataset: `npm run crawl`
- The process will start, the website will be crawled and the content extracted.

## Images
The Chat Bubble (Bottom Right corner)
![image](https://github.com/user-attachments/assets/4570b306-e9b0-429a-aa9e-56f9a40981ec)
AI Agent In Action
![image](https://github.com/user-attachments/assets/939f20d8-b5e8-4960-8489-27f7aeec8635)
AI Buy Agent In Action
![image](https://github.com/user-attachments/assets/faade160-607e-429b-87fb-b76b35c5932b)
PayRetailers Generated Payment Link from AI Agent
![image](https://github.com/user-attachments/assets/ce2d0c79-c60a-43a0-8cc7-341cb75ef7d5)
MVP Video of the Product in Action
https://github.com/user-attachments/assets/d9a42cb6-8381-47eb-86a1-59fcef12831d



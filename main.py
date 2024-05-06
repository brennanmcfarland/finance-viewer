import pandas as pd
import os
import glob
from flask import Flask, request
import sqlite3 as sl
import time
import datetime

app = Flask(__name__)

def get_all_data():
	print("loading transaction dataframes:")
	dir_path_to_dataframes = {}

	for dataframe_path in glob.glob("./sources/**/*.csv", recursive=True):
		print(f"found transaction dataframe at {dataframe_path}")

		dataframe_dir = os.path.dirname(dataframe_path)
		if dataframe_dir not in dir_path_to_dataframes:
			dir_path_to_dataframes[dataframe_dir] = []
		dir_path_to_dataframes[dataframe_dir].append(pd.read_csv(dataframe_path))
		
		print(f"loaded transaction dataframe at {dataframe_path}")

	print("done loading transaction dataframes")

	dir_path_to_data = { dir_path: pd.concat(dataframes) for dir_path, dataframes in dir_path_to_dataframes.items() }

	for dir_path, data in dir_path_to_data.items():
		data["Source"] = dir_path

	all_data = pd.concat(dir_path_to_data.values())
	all_data.reset_index(drop=True, inplace=True)
	
	db = sl.connect('in-memory-tmp.db')

	db.execute("""
		DROP TABLE TRANSACTIONS;
		""")
	
	db.execute("""
		CREATE TABLE TRANSACTIONS (
			id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			date DATE,
			description TEXT,
			amount FLOAT,
			account TEXT);
		""")
	
	# TODO: can probably use to_sql() for this by creating another df with only the cols to be ingested
	insert_statement = 'INSERT INTO TRANSACTIONS (id, date, description, amount, account) values(?, ?, ?, ?, ?)'
	to_insert = [(i, datetime.date(*(time.strptime(row['Date'], "%m/%d/%Y")[0:3])), row['Description'], row['Amount'], row['Account Name']) for i, (_, row) in enumerate(all_data.iterrows())]
	with db:
		db.executemany(insert_statement, to_insert)


@app.route("/test")
def test():
	return "Hello from server!"


@app.route("/")
def hello_world():
	get_all_data()

	db = sl.connect('in-memory-tmp.db')
	result = db.execute("SELECT date, description, amount, account FROM TRANSACTIONS ORDER BY date DESC")

	return result.fetchall()

@app.route("/transactions")
def get_transactions():
	get_all_data()
	db = sl.connect('in-memory-tmp.db')
	start_date = request.args.get('start_date')
	start_date = datetime.date(*(time.strptime(start_date, "%Y-%m-%d")[0:3]))
	end_date = request.args.get('end_date')
	end_date = datetime.date(*(time.strptime(end_date, "%Y-%m-%d")[0:3]))
	print(start_date)
	print(end_date)
	transactions_in_range = db.execute(f"SELECT * FROM TRANSACTIONS WHERE DATE(date) BETWEEN '{start_date}' AND '{end_date}'")
	return transactions_in_range.fetchall()

@app.route("/date-range")
def date_range():
	get_all_data()
	db = sl.connect('in-memory-tmp.db')
	min_date = db.execute("SELECT min(date) FROM TRANSACTIONS").fetchone()[0]
	max_date = db.execute("SELECT max(date) FROM TRANSACTIONS").fetchone()[0]
	return [min_date, max_date]

@app.route("/history")
def history():
	data = get_all_data()
	return data.to_json()
import pandas as pd
import os

file_name = "D:\Coding\WeHelp\dimalife\AUSDIMA.xlsx"
sheet =  "Product"


df = pd.read_excel(io=file_name, sheet_name=sheet)
  # print first 5 rows of the dataframe

# i=1
# for index, row in df.iterrows():
#     print(row["name"])
#     src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{row['name']}/{row['name']}-{i}.jpg"
#     print(src)
#     if i< df[df["name"]==row["name"]].shape[0]:
#       i+=1
#     else:
#       i=1

grouped_df = df.groupby(["id","name"])


# for key, index in grouped_df:
#   print(key[0].count())
#   # src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{row['name']}/{row['name']}-{i}.jpg"
#   # print(src)


path = "D:\Coding\WeHelp\dimalife\shopwear photos\product photos"
# print(os.listdir(path))
# print(os.listdir(path + "\\" + os.listdir(path)[0]))


for i in os.listdir(path):
  for j in os.listdir(path + "\\" + i):
    src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{i}/{j}"

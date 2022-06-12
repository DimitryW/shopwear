import pandas as pd
import os

# file_name = "D:\Coding\WeHelp\dimalife\products.xlsx"
# sheet =  "products"


# df = pd.read_excel(io=file_name, sheet_name=sheet)
#   # print first 5 rows of the dataframe
# print(df)

# i=1
# for index, row in df.iterrows():
#     print(row["product_name"])
#     print(row["price"])
    # src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{row['name']}/{row['name']}-{i}.jpg"
    # print(src)
    # if i< df[df["name"]==row["name"]].shape[0]:
    #   i+=1
    # else:
    #   i=1

# grouped_df = df.groupby(["id","name"])


# for key, index in grouped_df:
#   print(key[0].count())
#   # src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{row['name']}/{row['name']}-{i}.jpg"
#   # print(src)


# path = "D:\Coding\WeHelp\dimalife\shopwear photos\product photos"
# # print(os.listdir(path))
# # print(os.listdir(path + "\\" + os.listdir(path)[0]))


# for i in os.listdir(path):
#   for j in os.listdir(path + "\\" + i):
#     src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{i}/{j}"
#     new_src = f"shopwear/{i}/{j}"
#     print(src)


path="D:/Coding/WeHelp/dimalife/shopwear photos/吳先生"       

#获取该目录下所有文件，存入列表中
fileList=os.listdir(path)
# print(fileList)
# n=0
for i in range(len(fileList)):
  dirpath = "D:/Coding/WeHelp/dimalife/shopwear photos/吳先生/" +fileList[i]
  dirfile = os.listdir(dirpath)
  # print(dirfile)
  for j in range(len(dirfile)):
    oldname=dirpath+ os.sep + dirfile[j]
    # print(oldname)
    newname = dirpath + os.sep+fileList[i] +"-" +str(j+1)+".jpg"
    # print(newname)
    
    
    os.rename(oldname,newname)   #用os模块中的rename方法对文件改名
    print(oldname,'======>',newname)


# path = "D:\Coding\WeHelp\dimalife\shopwear photos\吳寶寶要的"

# for i in os.listdir(path):
#   for j in os.listdir(path + "\\" + i):
#     print(i)
#     print(j)
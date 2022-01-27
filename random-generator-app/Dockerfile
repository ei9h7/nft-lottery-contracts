FROM python:3.10.0
RUN pip3 install eth_abi
COPY ./src /app
ENTRYPOINT ["python", "/app/app.py"]
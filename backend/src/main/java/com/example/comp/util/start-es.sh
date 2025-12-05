#!/bin/bash

# Go to Elasticsearch directory
cd /usr/local/elasticsearch/elasticsearch-9.2.1/bin/ || {
    echo "Directory not found!"
    exit 1
}

# Start Elasticsearch
./elasticsearch

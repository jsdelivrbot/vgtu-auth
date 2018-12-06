#!/bin/sh
mongodump -d my_database --gzip -o /backup/vgtuauth-`date "+%Y-%m-%d"`

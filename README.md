`docker run -it --link local_graphcool-db_1:mysql --net local_graphcool --rm mysql sh -c 'exec mysql -h graphcool-db -uroot -pgraphcool'`

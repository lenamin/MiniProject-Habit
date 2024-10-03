insert into users(name, email, password) values
('홍길동', 'hong1@gmail.com', 'admin1234');
insert into users(name, email, password) values('이영록', 'rok@gmail.com', 'test1234');

insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('아침에 일찍 일어나기', '2024-09-30', '2024-12-31', '2024-09-30', 1);
insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('물 1L 마시기', '2024-09-29', '2024-12-31', '2024-09-29', 1);
insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('알고리즘 공부하기', '2024-09-30', '2024-12-31', '2024-09-30', 1);
insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('일찍 자기', '2024-10-2', '2024-12-31', '2024-10-2', 2);
insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('운동하기', '2024-09-30', '2024-12-31', '2024-09-30', 2);
insert into habits(habit_name, start_date, end_date, createdAt, user_id) values ('책 읽기', '2024-09-29', '2024-12-31', '2024-09-29', 2);


insert into records (memo, habit_id) values ('오늘은 7시 기상,,', 1);


import turtle
import math


screen = turtle.Screen()
screen.bgcolor("black")  
screen.setup(width=800, height=800)
screen.title("Heart Animation")

t = turtle.Turtle()
t.speed(0)  
t.hideturtle()


def heart_x(angle):
    return 16 * math.sin(angle) ** 3

def heart_y(angle):
    return 13 * math.cos(angle) - 5 * math.cos(2 * angle) - 2 * math.cos(3 * angle) - math.cos(4 * angle)


for i in range(1, 3):
    t.penup()
    t.goto(0, 0)
    t.pendown()
    
    
    if i % 2 == 0:
        t.color("#f73487") 
    else:
        t.color("#ff0000") 
    
    
    for angle in range(0, 629, 2): 
        a = angle / 100
        x = heart_x(a) * (i * 1.5 + 5) 
        y = heart_y(a) * (i * 1.5 + 5)
        t.goto(x, y)


t.penup()
t.goto(0, -20)
t.color("white")
t.write("ايلافيوو بنات عمي", align="center", font=("Arial", 20, "bold"))


turtle.done()
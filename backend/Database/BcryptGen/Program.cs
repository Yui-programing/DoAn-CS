using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string hash = BCrypt.Net.BCrypt.HashPassword("123123", workFactor: 11);
        Console.WriteLine(hash);
    }
}


<?php

require_once __DIR__ . '/../Models/Database.php';
require_once __DIR__ . '/../Models/Blog.php';

class BlogsSeeder {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function seed() {
        $blogs = [
            [
                'id' => 1,
                'title' => 'วิธีดูแลผิวหน้าให้ใส',
                'content' => 'เนื้อหาของบล็อกเกี่ยวกับการดูแลผิวหน้า...',
                'excerpt' => 'เคล็ดลับการดูแลผิวหน้าให้ใสอย่างเป็นธรรมชาติ',
                'image' => 'blog1.jpg',
                'status' => 'published'
            ],
            [
                'id' => 2,
                'title' => 'ทำความรู้จักกับ Treatment ยอดนิยม',
                'content' => 'เนื้อหาของบล็อกเกี่ยวกับ Treatment ยอดนิยม...',
                'excerpt' => 'รวม Treatment ที่ได้รับความนิยมในปี 2024',
                'image' => 'blog2.jpg',
                'status' => 'draft'
            ]
        ];

        foreach ($blogs as $blogData) {
            $blog = new Blog($this->db);
            $blog->title = $blogData['title'];
            $blog->content = $blogData['content'];
            $blog->excerpt = $blogData['excerpt'];
            $blog->image = $blogData['image'];
            $blog->status = $blogData['status'];

            if ($blog->create()) {
                echo "Blog '{$blog->title}' created successfully.\n";
            } else {
                echo "Failed to create blog '{$blog->title}'.\n";
            }
        }
    }
}
?> 
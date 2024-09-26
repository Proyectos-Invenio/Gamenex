'use client'

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Bell, Home, Mail, Bookmark, FileText, User, Settings, Search, Plus, MoreHorizontal,
  TrendingUp, Users, Menu, Heart, MessageCircle, Repeat, LogOut, X, ImageIcon, VideoIcon,
  Smile, ChevronRight, ChevronLeft
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

import Image from "next/image"
import { UserButton } from '@clerk/nextjs';


interface MediaItem {
  type: "image" | "video";
  url: string;
}

interface GameItem {
  title: string;
  image: string;
  posts: string;
}

interface Tweet {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  retweets: number;
  media?: MediaItem[];
  likedBy: string[];
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
}

const Carousel = ({ items, title }: { items: GameItem[]; title: string }) => {
  const [startIndex, setStartIndex] = useState(0)
  const itemsToShow = 4

  const nextSlide = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  const prevSlide = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  return (
    <div className="relative mb-8">
      <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      <div className="flex space-x-4 overflow-hidden">
        {items.slice(startIndex, startIndex + itemsToShow).map((game, index) => (
          <div key={index} className="w-1/4 min-w-[200px]">
            <div className="relative group cursor-pointer">
              <img src={game.image} alt={game.title} className="w-full h-40 object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                <div>
                  <h3 className="text-white font-bold">{game.title}</h3>
                  <p className="text-gray-300 text-sm">{game.posts} posts</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}

export function Interfaz() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isTextareaFocused, setIsTextareaFocused] = useState(false)
  const [activeTab, setActiveTab] = useState<"filtrado" | "general" | "foros" | "blog">("filtrado")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const favoriteGames: GameItem[] = [
    { title: "StarCraft", image: "https://blz-contentstack-images.akamaized.net/v3/assets/blt0e00eb71333df64e/blt4c868636503e9946/65815173d086840586bc0b04/og_image.webp", posts: "10 mil" },
    { title: "Overwatch", image: "data:image/jpeg;base64,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", posts: "15 mil" },
    { title: "Fortnite", image: "https://i.blogs.es/a4641d/fortnite2021/1366_2000.jpeg", posts: "34 mil" },
    { title: "League of Legends", image: "https://esports.as.com/2022/05/06/league-of-legends/League-Legends-contara-sistema-desafios_1571552855_971917_1440x810.jpg", posts: "22 mil" },
    { title: "Call of Duty", image: "https://bsmedia.business-standard.com/_media/bs/img/article/2024-02/29/full/1709193013-943.jpg", posts: "28 mil" },
  ]

  const trendingGames: GameItem[] = [
    { title: "Fortnite", image: "https://i.blogs.es/a4641d/fortnite2021/1366_2000.jpeg", posts: "30 mil" },
    { title: "Grand Theft Auto V", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwYCsxixBZRCmFPYlgKb5laxTjKRp263elrw&s", posts: "25 mil" },
    { title: "League of Legends", image: "https://esports.as.com/2022/05/06/league-of-legends/League-Legends-contara-sistema-desafios_1571552855_971917_1440x810.jpg", posts: "22 mil" },
    { title: "Call of Duty: Warzone", image: "https://bsmedia.business-standard.com/_media/bs/img/article/2024-02/29/full/1709193013-943.jpg", posts: "18 mil" },
    { title: "Minecraft", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/minecraft-Hy0Ue5Aw9Ue5Aw9.jpg", posts: "20 mil" },
  ]

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Nueva funcionalidad: Filtrado por juegos',
      content: 'Hemos añadido la opción de filtrar posts por juegos específicos. Ahora puedes ver contenido relacionado con tus juegos favoritos de manera más fácil.',
      date: '2023-09-26'
    },
    {
      id: '2',
      title: 'Mejoras en el rendimiento',
      content: 'Hemos optimizado la carga de imágenes y videos para una experiencia más rápida. Disfruta de una navegación más fluida en toda la plataforma.',
      date: '2023-09-25'
    },
    {
      id: '3',
      title: 'Nuevo diseño responsive',
      content: 'Gamenex ahora se adapta mejor a todos los dispositivos. Disfruta de una experiencia óptima tanto en tu computadora como en tu teléfono móvil.',
      date: '2023-09-24'
    },
  ])

  useEffect(() => {
    const storedTweets = localStorage.getItem('tweets')
    if (storedTweets) {
      setTweets(JSON.parse(storedTweets))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tweets', JSON.stringify(tweets))
  }, [tweets])

  const handlePost = () => {
    const newTweet: Tweet = {
      id: Date.now().toString(),
      content: postContent,
      author: {
        name: "Emilio Rodríguez",
        username: "@emiliojrb",
        avatar: "/placeholder-avatar.jpg",
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      retweets: 0,
      media: mediaItems,
      likedBy: [],
    }
    setTweets([newTweet, ...tweets])
    clearContent()
    setIsNewPostModalOpen(false)
  }

  const clearContent = () => {
    setPostContent("")
    setMediaItems([])
  }

  useEffect(() => {
    if (!isNewPostModalOpen) {
      clearContent()
    }
  }, [isNewPostModalOpen])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"]
      const newMediaItems: MediaItem[] = []

      Array.from(files).forEach((file) => {
        if (validTypes.includes(file.type)) {
          const reader = new FileReader()
          reader.onloadend = () => {
            newMediaItems.push({
              type: file.type.startsWith("image/") ? "image" : "video",
              url: reader.result as string,
            })
            if (newMediaItems.length === files.length) {
              setMediaItems((prevItems) => [...prevItems, ...newMediaItems])
            }
          }
          reader.readAsDataURL(file)
        } else {
          alert(`File ${file.name} is not supported. Only PNG, JPG, JPEG images and MP4 videos are allowed.`)
        }
      })
    }
  }

  const triggerFileUpload = (type: "image" | "video") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/png,image/jpeg,image/jpg" : "video/mp4"
      fileInputRef.current.multiple = type === "image"
      fileInputRef.current.click()
    }
  }

  const removeMediaItem = (index: number) => {
    setMediaItems((prevItems) => prevItems.filter((_, i) => i !== index))
  }

  const addEmoji = (emoji: any) => {
    setPostContent((prevContent) => prevContent + emoji.native)
  }

  const highlightHashtags = useCallback((text: string) => {
    return text.split(/(\s+)/).map((word, index) =>
      word.startsWith("#") ? (
        <span key={index} className="text-[#A354CA] font-bold">
          {word}
        </span>
      ) : (
        word
      )
    )
  }, [])

  const formatElapsedTime = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const elapsed = now.getTime() - postTime.getTime()
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  const handleLike = (tweetId: string) => {
    const currentUser = "@projectManager" // This should be dynamically set based on the logged-in user
    setTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.id === tweetId
          ? tweet.likedBy.includes(currentUser)
            ? { ...tweet, likes: tweet.likes - 1, likedBy: tweet.likedBy.filter(user => user !== currentUser) }
            : { ...tweet, likes: tweet.likes + 1, likedBy: [...tweet.likedBy, currentUser] }
          : tweet
      )
    )
  }

  const filteredTweets = tweets.filter(tweet =>
    tweet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tweet.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tweet.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const Sidebar = ({ className = "" }) => (
    <div className={`bg-[#0E0E10] p-4 space-y-4 flex flex-col h-full ${className}`}>
      <div className="flex items-center mb-6 w-12">
        <Image
          src="/Logo.svg"
          alt="Logo de Gamenex"
          width={50}
          height={50}
          className="w-full h-full"
        />
        <span className="text-xl font-bold text-white ml-2">GAMENEX</span>
      </div>
      <nav className="space-y-2 flex-grow">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <Home className="mr-2 h-4 w-4" /> Inicio
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <Bell className="mr-2 h-4 w-4" /> Notificaciones
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <Mail className="mr-2 h-4 w-4" /> Mensajes
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <Bookmark className="mr-2 h-4 w-4" /> Guardados
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white" onClick={() => setActiveTab("blog")}>
          <FileText className="mr-2 h-4 w-4" /> Blog de administrador
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <User className="mr-2 h-4 w-4" /> Perfil
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#A354CA] hover:text-white">
          <Settings className="mr-2 h-4 w-4" /> Configuración
        </Button>
      </nav>
      <div className="mt-auto border-t border-[#3C3C44] pt-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-[#3C3C44] p-2 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-2">
                <UserButton />
                <div>
                  <div className="font-semibold text-white">Emilio Rodríguez</div>
                  <div className="text-sm text-[#A354CA]">@emiliojrb</div>
                </div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-white" />
            </div>
          </PopoverTrigger>

        </Popover>
      </div>
    </div>
  )

  const Tweet = ({ tweet }: { tweet: Tweet }) => (
    <div className="bg-[#18181B] p-6 rounded-lg shadow-lg hover:bg-[#1c1c21] transition-colors duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="w-12 h-12 border-2 border-[#731B9F]">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback>{tweet.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">{tweet.author.name}</h3>
              <p className="text-sm text-[#A354CA]">{tweet.author.username}</p>
            </div>
            <span className="text-sm text-[#A354CA]">{formatElapsedTime(tweet.timestamp)}</span>
          </div>
          <p className="mt-2 text-white">{tweet.content}</p>
          {tweet.media && tweet.media.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {tweet.media.map((item, index) => (
                <div key={index} className="relative">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-auto rounded-lg object-cover aspect-square"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-auto rounded-lg object-cover aspect-square"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center mt-4 space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={`text-[#A354CA] hover:text-white hover:bg-[#731B9F] ${tweet.likedBy.includes("@projectManager") ? 'text-[#731B9F]' : ''}`}
              onClick={() => handleLike(tweet.id)}
            >
              <Heart className="w-4 h-4 mr-2" fill={tweet.likedBy.includes("@projectManager") ? '#731B9F' : 'none'} />
              {tweet.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-[#A354CA] hover:text-white hover:bg-[#731B9F]">
              <MessageCircle className="w-4 h-4 mr-2" />
              {tweet.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-[#A354CA] hover:text-white hover:bg-[#731B9F]">
              <Repeat className="w-4 h-4 mr-2" />
              {tweet.retweets}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const BlogPost = ({ post }: { post: BlogPost }) => (
    <Card className="bg-[#18181B] text-white border-[#3C3C44] mb-4 transform transition-all duration-300 hover:scale-105">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
        <p className="text-sm text-[#A354CA] mt-2">{post.date}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-[#0E0E10] text-white">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block md:w-64 border-r border-[#3C3C44]">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 p-4 bg-[#0E0E10] border-b border-[#3C3C44]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#A354CA]">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-[#0E0E10] w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="bg-[#2C2C2E]">
                  <TabsTrigger value="filtrado" className="data-[state=active]:bg-[#8E2DE2] data-[state=active]:text-white">
                    Filtrado
                  </TabsTrigger>
                  <TabsTrigger value="general" className="data-[state=active]:bg-[#8E2DE2] data-[state=active]:text-white">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="foros" className="data-[state=active]:bg-[#8E2DE2] data-[state=active]:text-white">
                    Foros
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-[#A354CA]">
                    <Search className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-[#18181B] text-white border-[#3C3C44]">
                  <div className="flex items-center space-x-2">
                    <Search className="h-3 w-3 text-[#A354CA]" />
                    <Input
                      type="search"
                      placeholder="Buscar en Gamenex"
                      className="flex-1 bg-[#2C2C2E] border-[#3C3C44] text-white placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    {filteredTweets.map((tweet) => (
                      <div key={tweet.id} className="p-2 hover:bg-[#2C2C2E] rounded-lg">
                        <p className="font-semibold">{tweet.author.name}</p>
                        <p className="text-sm text-[#A354CA]">{tweet.author.username}</p>
                        <p className="mt-1">{tweet.content.substring(0, 50)}...</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isNewPostModalOpen} onOpenChange={setIsNewPostModalOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="bg-[#731B9F] text-white hover:bg-[#A354CA]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-[#18181B] text-white border-[#3C3C44]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Crear Post</h2>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="border-2 border-[#731B9F]">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Emilio Rodríguez" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">Emilio Rodríguez</div>
                      <div className="text-sm text-[#A354CA]">@emiliojrb</div>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <div
                      className={`w-full min-h-[8rem] max-h-[20rem] bg-[#0E0E10] text-white border-[#3C3C44] rounded-lg p-2 overflow-auto whitespace-pre-wrap ${isTextareaFocused ? "border-2 border-[#A354CA]" : ""
                        }`}
                    >
                      {highlightHashtags(postContent)}
                    </div>
                    <textarea
                      ref={textareaRef}
                      className="absolute top-0 left-0 w-full h-full opacity-0"
                      placeholder="What's happening in your gaming world?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      onFocus={() => setIsTextareaFocused(true)}
                      onBlur={() => setIsTextareaFocused(false)}
                    />
                  </div>
                  {mediaItems.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {mediaItems.map((item, index) => (
                        <div key={index} className="relative">
                          {item.type === "image" ? (
                            <img
                              src={item.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-auto rounded-lg object-cover aspect-square"
                            />
                          ) : (
                            <video
                              src={item.url}
                              className="w-full h-auto rounded-lg object-cover aspect-square"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                            onClick={() => removeMediaItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#A354CA] hover:bg-[#3C3C44]"
                        onClick={() => triggerFileUpload("image")}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#A354CA] hover:bg-[#3C3C44]"
                        onClick={() => triggerFileUpload("video")}
                      >
                        <VideoIcon className="h-5 w-5" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#A354CA] hover:bg-[#3C3C44]"
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-none">
                          <div className="p-2 bg-[#18181B] rounded-lg">
                            <Picker
                              data={data}
                              onEmojiSelect={addEmoji}
                              theme="dark"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <Button
                    onClick={handlePost}
                    className="w-full bg-[#731B9F] text-white hover:bg-[#A354CA]"
                    disabled={!postContent.trim() && mediaItems.length === 0}
                  >
                    Publicar
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/jpg,video/mp4"
                    multiple
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === "filtrado" ? (
              selectedGame ? (
                <div>
                  <Button variant="ghost" onClick={() => setSelectedGame(null)} className="mb-4">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Volver
                  </Button>
                  <h2 className="text-2xl font-bold mb-4">{selectedGame.title}</h2>
                  <div className="space-y-4">
                    {filteredTweets.map((tweet) => (
                      <Tweet key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <Carousel items={favoriteGames} title="Tus videojuegos favoritos" />
                  <Carousel items={trendingGames} title="En tendencia" />
                </>
              )
            ) : activeTab === "general" ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {filteredTweets.map((tweet) => (
                  <Tweet key={tweet.id} tweet={tweet} />
                ))}
              </div>
            ) : activeTab === "foros" ? (
              <div className="text-center text-gray-500 mt-20">
                <h2 className="text-2xl font-bold mb-4">Foros</h2>
                <p>Esta sección está en desarrollo.</p>
              </div>
            ) : activeTab === "blog" ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-4">Blog de Administrador</h2>
                {blogPosts.map((post) => (
                  <BlogPost key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="hidden lg:block w-80 p-4 space-y-4 border-l border-[#3C3C44] bg-[#18181B] overflow-auto">
        <Card className="bg-[#0E0E10] border-[#3C3C44]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-[#731B9F]" />
              Tendencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <a href="#" className="block hover:bg-[#3C3C44] p-2 rounded-md transition-colors">
                  <div className="font-semibold text-white">#ActualizaciónFortnite</div>
                  <div className="text-sm text-[#A354CA]">3,995 posts</div>
                </a>
              </li>
              <li>
                <a href="#" className="block hover:bg-[#3C3C44] p-2 rounded-md transition-colors">
                  <div className="font-semibold text-white">#StreamersKick</div>
                  <div className="text-sm text-[#A354CA]">1,687 posts</div>
                </a>
              </li>
              <li>
                <a href="#" className="block hover:bg-[#3C3C44] p-2 rounded-md transition-colors">
                  <div className="font-semibold text-white">#eSports</div>
                  <div className="text-sm text-[#A354CA]">1,011 posts</div>
                </a>
              </li>
              <li>
                <a href="#" className="block hover:bg-[#3C3C44] p-2 rounded-md transition-colors">
                  <div className="font-semibold text-white">#HogwartsLegacy</div>
                  <div className="text-sm text-[#A354CA]">985 posts</div>
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-[#0E0E10] border-[#3C3C44]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center text-white">
              <Users className="mr-2 h-5 w-5 text-[#731B9F]" />
              Sugerencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="border-2 border-[#731B9F]">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Emilio RB" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">Emilio RB</div>
                    <div className="text-sm text-[#A354CA]">@robriwtf</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-[#731B9F] text-[#731B9F] hover:bg-[#731B9F] hover:text-white">
                  Seguir
                </Button>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="border-2 border-[#731B9F]">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Edgar AZ" />
                    <AvatarFallback>EA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">Edgar AZ</div>
                    <div className="text-sm text-[#A354CA]">@Anarky</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-[#731B9F] text-[#731B9F] hover:bg-[#731B9F] hover:text-white">
                  Seguir
                </Button>
              </li>
            </ul>
            <Button variant="link" className="w-full mt-4 text-[#731B9F] hover:text-[#A354CA]">
              Ver más
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}